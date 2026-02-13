/**
 * Reportes y Análisis - Panel Administrativo
 * SaCars - Corregido para coincidir con endpoints del backend
 */

let periodoActual = 'hoy';
let chartVentas, chartEstados, chartZonas;

$(document).ready(function() {
    verificarAutenticacionAdmin();
    cargarReportes();

    // Cambiar período
    $('.btn-periodo').on('click', function() {
        $('.btn-periodo').removeClass('activo');
        $(this).addClass('activo');
        periodoActual = $(this).data('periodo');
        cargarReporteVentas(); // Solo recargar ventas al cambiar período
    });
});

// Verificar autenticación
function verificarAutenticacionAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!usuario.correo || usuario.rol !== 'administrador') {
        window.location.href = '/admin/login';
        return;
    }
    
    $('#adminEmail').text(usuario.correo);
}

// Cargar todos los reportes
function cargarReportes() {
    cargarReporteVentas();
    cargarTopClientes();
    cargarReportePorEstado();
    cargarReportePorZona();
}

// Reporte de ventas - URLs corregidas
function cargarReporteVentas() {
    let endpoint = '';
    switch(periodoActual) {
        case 'hoy':
            endpoint = '/admin/reportes/api/ventas/hoy';
            break;
        case 'semana':
            endpoint = '/admin/reportes/api/ventas/ultima-semana';
            break;
        case 'mes':
            endpoint = '/admin/reportes/api/ventas/ultimo-mes';
            break;
    }

    $.ajax({
        url: endpoint,
        method: 'GET',
        success: function(data) {
            mostrarReporteVentas(data);
        },
        error: function() {
            $('#tablaVentas').html('<tr><td colspan="3" class="empty-state">Error al cargar reporte</td></tr>');
            $('#totalVentas').text('S/ 0.00');
        }
    });
}

// Mostrar reporte de ventas - Adaptado para ReporteVentasDTO
function mostrarReporteVentas(data) {
    // El backend devuelve un objeto ReporteVentasDTO, no un array
    const totalVentas = data.totalVentas || 0;
    const totalFormateado = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(totalVentas);
    $('#totalVentas').text(totalFormateado);

    // Actualizar tabla con resumen
    const tbody = $('#tablaVentas');
    tbody.empty();

    if (data.totalPedidos === 0) {
        tbody.html('<tr><td colspan="3" class="empty-state">No hay pedidos para este período</td></tr>');
        if (chartVentas) chartVentas.destroy();
        return;
    }

    // Mostrar resumen del período
    const ticketPromedio = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(data.ticketPromedio || 0);

    tbody.append(`
        <tr>
            <td><strong>📋 ${data.periodoDescripcion || 'Período'}</strong></td>
            <td><span class="badge badge-info">${data.totalPedidos || 0} pedidos</span></td>
            <td><strong>${totalFormateado}</strong></td>
        </tr>
        <tr>
            <td>✅ Completados</td>
            <td><span class="badge badge-success">${data.pedidosCompletados || 0}</span></td>
            <td>-</td>
        </tr>
        <tr>
            <td>⏳ Pendientes</td>
            <td><span class="badge badge-warning">${data.pedidosPendientes || 0}</span></td>
            <td>-</td>
        </tr>
        <tr>
            <td>📊 Ticket Promedio</td>
            <td>-</td>
            <td><strong>${ticketPromedio}</strong></td>
        </tr>
    `);

    // Gráfico de barras para el resumen
    if (chartVentas) chartVentas.destroy();

    const ctx = document.getElementById('chartVentas').getContext('2d');
    chartVentas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Completados', 'Pendientes'],
            datasets: [{
                label: 'Pedidos',
                data: [data.pedidosCompletados || 0, data.pedidosPendientes || 0],
                backgroundColor: ['rgba(39, 174, 96, 0.8)', 'rgba(255, 193, 7, 0.8)'],
                borderColor: ['#27ae60', '#ffc107'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Top clientes - URL corregida
function cargarTopClientes() {
    $.ajax({
        url: '/admin/reportes/api/clientes/top',
        method: 'GET',
        success: function(data) {
            mostrarTopClientes(data);
        },
        error: function() {
            $('#tablaTopClientes').html('<tr><td colspan="5" class="empty-state">Error al cargar reporte</td></tr>');
        }
    });
}

// Mostrar top clientes - Campo corregido: totalGastado
function mostrarTopClientes(data) {
    const tbody = $('#tablaTopClientes');
    tbody.empty();

    if (!data || data.length === 0) {
        tbody.html('<tr><td colspan="5" class="empty-state">No hay datos disponibles</td></tr>');
        return;
    }

    data.forEach((cliente, index) => {
        // El backend usa 'totalGastado', no 'totalComprado'
        const totalComprado = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(cliente.totalGastado || 0);

        // Medallas para los 3 primeros
        let medalla = '';
        if (index === 0) medalla = '🥇';
        else if (index === 1) medalla = '🥈';
        else if (index === 2) medalla = '🥉';

        const fila = `
            <tr>
                <td><strong>${medalla} ${index + 1}</strong></td>
                <td>${cliente.nombreCompleto || '-'}</td>
                <td>${cliente.email || '-'}</td>
                <td><span class="badge badge-info">${cliente.totalPedidos || 0}</span></td>
                <td><strong>${totalComprado}</strong></td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// Reporte por estado - URL corregida
function cargarReportePorEstado() {
    $.ajax({
        url: '/admin/reportes/api/pedidos/por-estado',
        method: 'GET',
        success: function(data) {
            mostrarReportePorEstado(data);
        },
        error: function() {
            $('#tablaEstados').html('<tr><td colspan="2" class="empty-state">Error al cargar reporte</td></tr>');
        }
    });
}

// Mostrar reporte por estado - Adaptado para Map<String, Long>
function mostrarReportePorEstado(data) {
    const tbody = $('#tablaEstados');
    tbody.empty();

    // El backend devuelve un Map {estado: cantidad}, convertir a array
    const estados = Object.entries(data).map(([estado, cantidad]) => ({
        estado: estado.toLowerCase(),
        cantidad: cantidad
    }));

    if (estados.length === 0) {
        tbody.html('<tr><td colspan="2" class="empty-state">No hay datos disponibles</td></tr>');
        if (chartEstados) chartEstados.destroy();
        return;
    }

    // Tabla
    estados.forEach(item => {
        let icon = '';
        switch(item.estado) {
            case 'pendiente': icon = '⏳'; break;
            case 'completado': icon = '✅'; break;
            case 'cancelado': icon = '❌'; break;
            default: icon = '📋';
        }

        const fila = `
            <tr>
                <td>${icon} ${item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}</td>
                <td><span class="badge badge-info">${item.cantidad}</span></td>
            </tr>
        `;
        tbody.append(fila);
    });

    // Gráfico circular
    const labels = estados.map(item => item.estado.charAt(0).toUpperCase() + item.estado.slice(1));
    const valores = estados.map(item => item.cantidad);
    const colores = estados.map(item => {
        switch(item.estado) {
            case 'pendiente': return '#ffc107';
            case 'completado': return '#27ae60';
            case 'cancelado': return '#e74c3c';
            default: return '#95a5a6';
        }
    });

    if (chartEstados) chartEstados.destroy();

    const ctx = document.getElementById('chartEstados').getContext('2d');
    chartEstados = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Reporte por zona - URL corregida
function cargarReportePorZona() {
    // Cargar tanto ingresos como cantidad de pedidos por zona
    Promise.all([
        fetch('/admin/reportes/api/ingresos/por-zona').then(r => r.json()),
        fetch('/admin/reportes/api/pedidos/por-zona').then(r => r.json())
    ])
    .then(([ingresos, pedidos]) => {
        mostrarReportePorZona(ingresos, pedidos);
    })
    .catch(() => {
        $('#tablaZonas').html('<tr><td colspan="3" class="empty-state">Error al cargar reporte</td></tr>');
    });
}

// Mostrar reporte por zona - Adaptado para Map<String, BigDecimal>
function mostrarReportePorZona(ingresosData, pedidosData) {
    const tbody = $('#tablaZonas');
    tbody.empty();

    // Convertir Maps a array combinado
    const zonas = Object.entries(ingresosData).map(([zona, ingresos]) => ({
        zona: zona || 'Sin especificar',
        totalIngresos: ingresos || 0,
        cantidadPedidos: pedidosData[zona] || 0
    }));

    if (zonas.length === 0) {
        tbody.html('<tr><td colspan="3" class="empty-state">No hay datos disponibles</td></tr>');
        if (chartZonas) chartZonas.destroy();
        return;
    }

    // Ordenar por ingresos descendente
    zonas.sort((a, b) => b.totalIngresos - a.totalIngresos);

    // Tabla
    zonas.forEach(item => {
        const ingresos = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(item.totalIngresos);

        const fila = `
            <tr>
                <td>📍 ${item.zona}</td>
                <td><span class="badge badge-info">${item.cantidadPedidos}</span></td>
                <td><strong>${ingresos}</strong></td>
            </tr>
        `;
        tbody.append(fila);
    });

    // Gráfico de barras
    const labels = zonas.map(item => item.zona);
    const valores = zonas.map(item => item.totalIngresos);

    if (chartZonas) chartZonas.destroy();

    const ctx = document.getElementById('chartZonas').getContext('2d');
    chartZonas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ingresos (S/)',
                data: valores,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(39, 174, 96, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(52, 152, 219, 0.8)'
                ],
                borderColor: [
                    '#667eea', '#764ba2', '#ffc107', '#27ae60', '#e74c3c', '#3498db'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'S/ ' + value.toLocaleString('es-PE');
                        }
                    }
                }
            }
        }
    });
}

// Estilos adicionales mejorados
const style = document.createElement('style');
style.textContent = `
    .btn-periodo {
        background: white;
        color: #1a1a2e;
        padding: 10px 20px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 14px;
    }
    .btn-periodo:hover {
        border-color: #667eea;
        color: #667eea;
    }
    .btn-periodo.activo {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: transparent;
    }
    .reporte-section {
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        border: 1px solid #e8e8e8;
    }
    .reporte-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
    }
    .reporte-header h2 {
        margin: 0;
        color: #ffffff;
        font-size: 18px;
        font-weight: 600;
    }
    .reporte-total {
        font-size: 24px;
        font-weight: bold;
        color: #4ade80;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .reporte-body {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .reporte-body table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .reporte-body table thead {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    .reporte-body table th {
        padding: 14px 16px;
        text-align: left;
        color: #ffffff;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .reporte-body table td {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        color: #374151;
        font-size: 14px;
    }
    .reporte-body table tbody tr:hover {
        background: #f8fafc;
    }
    .reporte-body table tbody tr:last-child td {
        border-bottom: none;
    }
    .chart-container {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
    }
    .tabla-reporte {
        overflow-x: auto;
    }
    .badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
    }
    .badge-info {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
    }
    .badge-success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
    }
    .badge-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
    }
    .badge-danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
    }
    .empty-state {
        text-align: center;
        color: #9ca3af;
        padding: 30px;
        font-style: italic;
    }
    .loading {
        text-align: center;
        color: #6b7280;
        padding: 20px;
    }
    @media (max-width: 1200px) {
        .reporte-body {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);
