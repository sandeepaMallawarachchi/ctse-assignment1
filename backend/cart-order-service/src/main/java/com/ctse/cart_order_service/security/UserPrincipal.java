package com.ctse.cart_order_service.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Data
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private String userId;
    private String email;
    private Collection<? extends GrantedAuthority> authorities;

    public boolean isAdmin() {
        return authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @Override public String getPassword()  { return null; }
    @Override public String getUsername()  { return email; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
