package com.sacars.service;

import com.sacars.dto.UsuarioRegistroDTO;
import com.sacars.model.Usuario;
import com.sacars.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Transactional
    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    @Transactional
    public Usuario guardar(UsuarioRegistroDTO registroDTO) {

        Usuario usuario = new Usuario();
        usuario.setNombre(registroDTO.getNombre());
        usuario.setApellido(registroDTO.getApellido());
        usuario.setEmail(registroDTO.getEmail());
        usuario.setTelefono(registroDTO.getTelefono());
        usuario.setDireccion(registroDTO.getDireccion());

        // Encriptar contraseña
        usuario.setContrasena(passwordEncoder.encode(registroDTO.getContrasena()));

        usuario.setActivo(true);
        usuario.setRol(Usuario.RolUsuario.CLIENTE);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public boolean existePorEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
     @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean passwordCoincide(String raw, String encoded) {
        return passwordEncoder.matches(raw, encoded);
    }

}
