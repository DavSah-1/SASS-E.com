# IoT Devices Database Routing Documentation

## Overview

The IoT Devices feature implements a dual-database architecture that routes Admin users to the Manus MySQL database and regular Users to the Supabase PostgreSQL database with Row Level Security (RLS) enforcement.

## Architecture

### Database Routing Logic

All IoT operations use the `dbRoleAware` helper functions in `server/dbRoleAware.ts` which automatically route based on the user's role:

```typescript
if (ctx.user.role === "admin") {
  // Route to Manus MySQL database
  return await db.functionName(...);
} else {
  // Route to Supabase PostgreSQL database with RLS
  const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
  // ... Supabase query
}
```

### Supported Operations

#### 1. List Devices (`getUserIoTDevices`)
- **Admin**: Queries `iot_devices` table in Manus MySQL
- **User**: Queries `iot_devices` table in Supabase with RLS filter (`user_id = ctx.user.id`)
- **Field Mapping**: Supabase snake_case fields are mapped to camelCase for consistency

#### 2. Add Device (`addIoTDevice`)
- **Admin**: Inserts into Manus MySQL `iot_devices` table
- **User**: Inserts into Supabase `iot_devices` table with all required fields:
  - `user_id`, `device_id`, `device_name`, `device_type`
  - `room`, `manufacturer`, `model`, `status`
  - `state`, `capabilities`, `connection_type`, `connection_config`
  - `last_seen`, `created_at`, `updated_at`

#### 3. Get Device by ID (`getIoTDeviceById`)
- **Admin**: Queries by `deviceId` in Manus MySQL
- **User**: Queries by `device_id` with RLS filter in Supabase
- **Field Mapping**: Returns camelCase field names for consistency

#### 4. Update Device State (`updateIoTDeviceState`)
- **Admin**: Updates `state` and `status` in Manus MySQL
- **User**: Updates `state`, `status`, and `updated_at` in Supabase with RLS filter

#### 5. Delete Device (`deleteIoTDevice`)
- **Admin**: Deletes from Manus MySQL by `deviceId`
- **User**: Deletes from Supabase by `device_id` with RLS filter

#### 6. Save Command History (`saveIoTCommand`)
- **Admin**: Inserts into Manus MySQL `iot_command_history` table
- **User**: Inserts into Supabase `iot_command_history` table with fields:
  - `user_id`, `device_id`, `command`, `parameters`
  - `status`, `error_message`, `executed_at`

#### 7. Get Command History (`getDeviceCommandHistory`)
- **Admin**: Queries Manus MySQL `iot_command_history` by `deviceId`
- **User**: Queries Supabase `iot_command_history` with RLS filter
- **Field Mapping**: Returns camelCase field names

## Field Name Mapping

### Manus MySQL (camelCase)
- `deviceId`, `deviceName`, `deviceType`, `userId`
- `connectionType`, `connectionConfig`, `lastSeen`
- `createdAt`, `updatedAt`

### Supabase PostgreSQL (snake_case)
- `device_id`, `device_name`, `device_type`, `user_id`
- `connection_type`, `connection_config`, `last_seen`
- `created_at`, `updated_at`

All Supabase responses are automatically mapped to camelCase in the `dbRoleAware` functions to ensure consistent data structure for the frontend.

## Security

### Row Level Security (RLS)

Supabase enforces RLS policies that ensure:
- Users can only access their own devices (`user_id = auth.uid()`)
- Users can only modify their own devices
- Users can only view their own command history

### Admin Isolation

Admin users access a completely separate database (Manus MySQL), ensuring:
- Admin data is isolated from user data
- No risk of RLS bypass or data leakage
- Independent scaling and management

## Testing

### Manual Testing

1. **Test as Admin**:
   - Login as admin user (role: admin)
   - Navigate to `/devices`
   - Add a device → should appear in Manus MySQL
   - Control device → should update in Manus MySQL
   - View command history → should query Manus MySQL

2. **Test as Regular User**:
   - Login as regular user (role: user)
   - Navigate to `/devices`
   - Add a device → should appear in Supabase
   - Control device → should update in Supabase
   - View command history → should query Supabase with RLS

### Automated Testing

Unit tests are available in `server/dbRoleAware.test.ts` that verify:
- Admin IoT devices route to Manus MySQL
- User IoT devices route to Supabase
- RLS enforcement for user devices
- Field name mapping consistency

## Troubleshooting

### Common Issues

1. **Field Name Mismatch**:
   - Ensure Supabase queries use snake_case field names
   - Ensure responses are mapped to camelCase before returning

2. **RLS Violations**:
   - Verify `user_id` is included in all Supabase queries
   - Check that RLS policies are enabled in Supabase

3. **Missing Fields**:
   - Ensure all required fields are included in `addIoTDevice`
   - Verify Supabase table schema matches Manus MySQL schema

## Future Enhancements

1. **Device Sharing**: Allow users to share devices with other users
2. **Bulk Operations**: Support bulk device control and management
3. **Device Analytics**: Track device usage and performance metrics
4. **Automation Rules**: Create schedules and triggers for device control

## References

- **Router**: `server/routers.ts` (IoT procedures)
- **Database Helpers**: `server/dbRoleAware.ts` (routing logic)
- **Tests**: `server/dbRoleAware.test.ts` (automated tests)
- **Frontend**: `client/src/pages/IoTDevices.tsx` (UI)
