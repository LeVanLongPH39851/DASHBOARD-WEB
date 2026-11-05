
-- ============================================================
-- CUSTOM ROLE DATABASE - POSTGRESQL 16
-- GROUP HIERARCHY: PARENT - CHILD
-- ============================================================

BEGIN;

-- 1. ROLES
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    scope VARCHAR(20) NOT NULL
        CHECK (scope IN ('GLOBAL', 'GROUP')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (role_code, role_name, scope, description)
VALUES
    ('admin_ami', 'Admin AMI', 'GLOBAL', 'Quản trị toàn bộ hệ thống'),
    ('super_admin', 'Super Admin', 'GLOBAL', 'Quản lý Group và phân quyền Dashboard'),
    ('group_admin', 'Group Admin', 'GROUP', 'Quản lý thành viên và Dashboard trong Group'),
    ('group_member', 'Group Member', 'GROUP', 'Thành viên chỉ được xem Dashboard được cấp');


-- 2. PERMISSIONS
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO permissions (permission_code, permission_name, description)
VALUES
    ('system.manage', 'Quản lý hệ thống', 'Quản lý toàn bộ hệ thống'),

    ('group.create', 'Tạo Group', 'Tạo Group mới'),
    ('group.view', 'Xem Group', 'Xem thông tin Group'),
    ('group.update', 'Sửa Group', 'Cập nhật thông tin Group'),
    ('group.delete', 'Xóa Group', 'Xóa Group'),

    ('group_admin.assign', 'Gán Group Admin', 'Gán hoặc thay đổi Group Admin'),

    ('group_dashboard.assign', 'Gán Dashboard cho Group', 'Cấp Dashboard cho Group'),

    ('member.create', 'Thêm thành viên', 'Thêm user vào Group'),
    ('member.view', 'Xem thành viên', 'Xem danh sách thành viên'),
    ('member.update', 'Sửa thành viên', 'Cập nhật thông tin thành viên'),
    ('member.delete', 'Xóa thành viên', 'Xóa thành viên khỏi Group'),

    ('member_dashboard.assign', 'Gán Dashboard cho thành viên', 'Cấp Dashboard cho thành viên'),
    ('member_dashboard.revoke', 'Thu hồi Dashboard', 'Thu hồi Dashboard của thành viên'),

    ('dashboard.view', 'Xem Dashboard', 'Xem Dashboard được cấp'),
    ('password.change', 'Đổi mật khẩu', 'Cho phép đổi mật khẩu'),
    ('otp.verify', 'Xác thực OTP', 'Cho phép thực hiện xác thực OTP');


-- 3. ROLE PERMISSIONS
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

-- Admin AMI: Toàn quyền hệ thống
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.role_code = 'admin_ami';

-- Super Admin: Quản lý Group và Dashboard
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_code IN (
    'group.create',
    'group.view',
    'group.update',
    'group.delete',
    'group_admin.assign',
    'group_dashboard.assign',
    'member.view',
    'dashboard.view'
)
WHERE r.role_code = 'super_admin';

-- Group Admin: Chỉ quản lý thành viên và Dashboard trong Group
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_code IN (
    'group.view',
    'member.create',
    'member.view',
    'member.update',
    'member.delete',
    'member_dashboard.assign',
    'member_dashboard.revoke',
    'dashboard.view'
)
WHERE r.role_code = 'group_admin';

-- Group Member: Chỉ xem Dashboard và đổi mật khẩu
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_code IN (
    'dashboard.view',
    'password.change'
)
WHERE r.role_code = 'group_member';


-- 4. USER GLOBAL ROLES
CREATE TABLE user_global_roles (
    id BIGSERIAL PRIMARY KEY,

    superset_user_id BIGINT NOT NULL,

    role_id BIGINT NOT NULL REFERENCES roles(id),

    assigned_by BIGINT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_global_role
        UNIQUE (superset_user_id, role_id)
);


-- 5. GROUPS
CREATE TABLE groups (
    id BIGSERIAL PRIMARY KEY,

    group_name VARCHAR(150) NOT NULL UNIQUE,

    description TEXT,

    -- NULL: Group cấp cao nhất
    -- Có giá trị: Group con
    parent_group_id BIGINT
        REFERENCES groups(id)
        ON DELETE RESTRICT,

    created_by BIGINT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_group_not_self_parent
        CHECK (parent_group_id IS NULL OR parent_group_id <> id)
);

CREATE INDEX idx_groups_parent_group
    ON groups(parent_group_id);


-- 6. GROUP MEMBERS
CREATE TABLE group_members (
    id BIGSERIAL PRIMARY KEY,

    group_id BIGINT NOT NULL
        REFERENCES groups(id) ON DELETE CASCADE,

    superset_user_id BIGINT NOT NULL,

    role_id BIGINT NOT NULL REFERENCES roles(id),

    created_by BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_group_member
        UNIQUE (group_id, superset_user_id),

    CONSTRAINT chk_group_member_role
        CHECK (role_id > 0)
);


-- 7. GROUP DASHBOARDS
CREATE TABLE group_dashboards (
    id BIGSERIAL PRIMARY KEY,

    group_id BIGINT NOT NULL
        REFERENCES groups(id) ON DELETE CASCADE,

    dashboard_id BIGINT NOT NULL,

    assigned_by BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_group_dashboard
        UNIQUE (group_id, dashboard_id)
);


-- 8. MEMBER DASHBOARDS
CREATE TABLE member_dashboards (
    id BIGSERIAL PRIMARY KEY,

    group_id BIGINT NOT NULL,

    superset_user_id BIGINT NOT NULL,

    dashboard_id BIGINT NOT NULL,

    assigned_by BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_member_dashboard_member
        FOREIGN KEY (group_id, superset_user_id)
        REFERENCES group_members(group_id, superset_user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_member_dashboard_group_dashboard
        FOREIGN KEY (group_id, dashboard_id)
        REFERENCES group_dashboards(group_id, dashboard_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_member_dashboard
        UNIQUE (group_id, superset_user_id, dashboard_id)
);


-- 9. AUDIT LOGS
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,

    superset_user_id BIGINT,

    action VARCHAR(100) NOT NULL,

    target_type VARCHAR(100),

    target_id VARCHAR(100),

    description TEXT,

    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 10. INDEXES
CREATE INDEX idx_user_global_roles_user
    ON user_global_roles(superset_user_id);

CREATE INDEX idx_group_members_user
    ON group_members(superset_user_id);

CREATE INDEX idx_group_members_group
    ON group_members(group_id);

CREATE INDEX idx_group_dashboards_group
    ON group_dashboards(group_id);

CREATE INDEX idx_member_dashboards_user
    ON member_dashboards(superset_user_id);

CREATE INDEX idx_member_dashboards_group
    ON member_dashboards(group_id);

CREATE INDEX idx_audit_logs_user
    ON audit_logs(superset_user_id);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at DESC);

COMMIT;
