package com.amine.pfemanager.model;

/**
 * Roles used by Spring Security authorities.
 * New accounts register as ROLE_STUDENT; supervisors and admins
 * are assigned by an existing admin.
 */
public enum Role {
    ROLE_STUDENT,
    ROLE_SUPERVISOR,
    ROLE_ADMIN
}
