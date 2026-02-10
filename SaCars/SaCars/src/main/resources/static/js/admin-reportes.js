/**
 * Reportes y Análisis - Panel Administrativo
 * SaCars
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
        cargarReportes();
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

// Reporte de ventas
function cargarReporteVentas() {
    let endpoint = '';
    switch(periodoActual) {
        case 'hoy':
            endpoint = '/admin/reportes/api/ventas/hoy';
            break;
        case 'semana':
            endpoint = '/admin/reportes/api/ventas/semana';
            break;
        case 'mes':
            endpoint = '/admin/reportes/api/ventas/mes';
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
        }
    });
}

// Mostrar reporte de ventas
function mostrarReporteVentas(data) {
    // Actualizar total
    const total = data.reduce((sum, item) => sum + item.total, 0);
    const totalFormateado = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(total);
    $('#totalVentas').text(totalFormateado);

    // Actualizar tabla
    const tbody = $('#tablaVentas');
    tbody.empty();

    if (data.length === 0) {
        tbody.html('<tr><td colspan="3" class="empty-state">No hay datos para este período</td></tr>');
        if (chartVentas) chartVentas.destroy();
        return;
    }

    data.forEach(item => {
        const totalItem = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(item.total);

        const fila = `
            <tr>
                <td>${item.fecha}</td>
                <td><span class="badge badge-info">${item.cantidadPedidos}</span></td>
                <td><strong>${totalItem}</strong></td>
            </tr>
        `;
        tbody.append(fila);
    });

    // Actualizar gráfico
    const labels = data.map(item => item.fecha);
    const valores = data.map(item => item.total);

    if (chartVentas) chartVentas.destroy();

    const ctx = document.getElementById('chartVentas').getContext('2d');
    chartVentas = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas (S/)',
                data: valores,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
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

// Top clientes
function cargarTopClientes() {
    $.ajax({
        url: '/admin/reportes/api/top-clientes',
        method: 'GET',
        success: function(data) {
            mostrarTopClientes(data);
        },
        error: function() {
            $('#tablaTopClientes').html('<tr><td colspan="5" class="empty-state">Error al cargar reporte</td></tr>');
        }
    });
}

// Mostrar top clientes
function mostrarTopClientes(data) {
    const tbody = $('#tablaTopClientes');
    tbody.empty();

    if (data.length === 0) {
        tbody.html('<tr><td colspan="5" class="empty-state">No hay datos disponibles</td></tr>');
        return;
    }

    data.forEach((cliente, index) => {
        const totalComprado = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(cliente.totalComprado);

        // Medallas para los 3 primeros
        let medalla = '';
        if (index === 0) medalla = '🥇';
        else if (index === 1) medalla = '🥈';
        else if (index === 2) medalla = '🥉';

        const fila = `
            <tr>
                <td><strong>${medalla} ${index + 1}</strong></td>
                <td>${cliente.nombreCompleto}</td>
                <td>${cliente.email}</td>
                <td><span class="badge badge-info">${cliente.totalPedidos}</span></td>
                <td><strong>${totalComprado}</strong></td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// Reporte por estado
function cargarReportePorEstado() {
    $.ajax({
        url: '/admin/reportes/api/pedidos-por-estado',
        method: 'GET',
        success: function(data) {
            mostrarReportePorEstado(data);
        },
        error: function() {
            $('#tablaEstados').html('<tr><td colspan="2" class="empty-state">Error al cargar reporte</td></tr>');
        }
    });
}

// Mostrar reporte por estado
function mostrarReportePorEstado(data) {
    const tbody = $('#tablaEstados');
    tbody.empty();

    if (data.length === 0) {
        tbody.html('<tr><td colspan="2" class="empty-state">No hay datos disponibles</td></tr>');
        if (chartEstados) chartEstados.destroy();
        return;
    }

    // Tabla
    data.forEach(item => {
        let icon = '';
        switch(item.estado) {
            case 'pendiente': icon = '⏳'; break;
            case 'completado': icon = '✅'; break;
            case 'cancelado': icon = '❌'; break;
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
    const labels = data.map(item => item.estado.charAt(0).toUpperCase() + item.estado.slice(1));
    const valores = data.map(item => item.cantidad);
    const colores = data.map(item => {
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

// Reporte por zona
function cargarReportePorZona() {
    $.ajax({
        url: '/admin/reportes/api/ingresos-por-zona',
        method: 'GET',
        success: function(data) {
            mostrarReportePorZona(data);
        },
        error: function() {
            $('#tablaZonas').html('<tr><td colspan="3" class="empty-state">Error al cargar reporte</td></tr>');
        }
    });
}

// Mostrar reporte por zona
function mostrarReportePorZona(data) {
    const tbody = $('#tablaZonas');
    tbody.empty();

    if (data.length === 0) {
        tbody.html('<tr><td colspan="3" class="empty-state">No hay datos disponibles</td></tr>');
        if (chartZonas) chartZonas.destroy();
        return;
    }

    // Tabla
    data.forEach(item => {
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
    const labels = data.map(item => item.zona);
    const valores = data.map(item => item.totalIngresos);

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
                    'rgba(39, 174, 96, 0.8)'
                ],
                borderColor: [
                    '#667eea',
                    '#764ba2',
                    '#ffc107',
                    '#27ae60'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
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

// Estilos adicionales
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
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        margin-bottom: 20px;
    }
    .reporte-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f0f0;
    }
    .reporte-header h2 {
        margin: 0;
        color: #1a1a2e;
        font-size: 20px;
    }
    .reporte-total {
        font-size: 24px;
        font-weight: bold;
        color: #27ae60;
    }
    .reporte-body {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .chart-container {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
    }
    .tabla-reporte {
        overflow-x: auto;
    }
    @media (max-width: 1200px) {
        .reporte-body {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);
