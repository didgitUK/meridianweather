'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';

async function parseJson(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed');
  }
  return payload;
}

export function AdminUsersPanel({ currentUser, onUserUpdated }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [profileName, setProfileName] = useState(currentUser?.displayName ?? '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email ?? '');
  const [profileUserId, setProfileUserId] = useState(currentUser?.id ?? null);
  const [profileMessage, setProfileMessage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  if (currentUser?.id !== profileUserId) {
    setProfileUserId(currentUser?.id ?? null);
    setProfileName(currentUser?.displayName ?? '');
    setProfileEmail(currentUser?.email ?? '');
  }

  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function refreshUsers() {
    const payload = await parseJson(await fetch('/api/admin/users'));
    setUsers(payload.users ?? []);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await refreshUsers();
        if (!cancelled) {
          setError('');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveProfile(event) {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage('');
    setError('');

    try {
      const payload = await parseJson(
        await fetch('/api/admin/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: profileName,
            email: profileEmail,
          }),
        }),
      );
      onUserUpdated?.(payload.user);
      setProfileMessage('Profile updated');
      await refreshUsers();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage('');
    setError('');

    try {
      await parseJson(
        await fetch('/api/admin/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword,
            password: nextPassword,
          }),
        }),
      );
      setCurrentPassword('');
      setNextPassword('');
      setPasswordMessage('Password updated');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      await parseJson(
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: newName,
            email: newEmail,
            password: newPassword,
          }),
        }),
      );
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      await refreshUsers();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleActive(user) {
    setError('');
    try {
      await parseJson(
        await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, active: !user.active }),
        }),
      );
      await refreshUsers();
    } catch (toggleError) {
      setError(toggleError.message);
    }
  }

  async function handleDeleteUser(user) {
    if (!window.confirm(`Delete admin ${user.email}?`)) {
      return;
    }

    setError('');
    try {
      await parseJson(
        await fetch('/api/admin/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id }),
        }),
      );
      await refreshUsers();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleResetPassword(user) {
    const password = window.prompt(`New password for ${user.email} (min 8 characters)`);
    if (!password) {
      return;
    }

    setError('');
    try {
      await parseJson(
        await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, password }),
        }),
      );
    } catch (resetError) {
      setError(resetError.message);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading admin users…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <AdminPanel title="Your profile" description="Update the account shown in the sidebar.">
        <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Display name">
            <Input value={profileName} onChange={(event) => setProfileName(event.target.value)} required />
          </AdminField>
          <AdminField label="Email">
            <Input
              type="email"
              value={profileEmail}
              onChange={(event) => setProfileEmail(event.target.value)}
              required
            />
          </AdminField>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving…' : 'Save profile'}
            </Button>
            {profileMessage ? <p className="text-sm text-muted-foreground">{profileMessage}</p> : null}
          </div>
        </form>
      </AdminPanel>

      <AdminPanel title="Change password" description="Use your current password to set a new one.">
        <form onSubmit={handleChangePassword} className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Current password">
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </AdminField>
          <AdminField label="New password" hint="At least 8 characters">
            <Input
              type="password"
              autoComplete="new-password"
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              minLength={8}
              required
            />
          </AdminField>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? 'Updating…' : 'Update password'}
            </Button>
            {passwordMessage ? <p className="text-sm text-muted-foreground">{passwordMessage}</p> : null}
          </div>
        </form>
      </AdminPanel>

      <AdminPanel title="Admin users" description="Create and manage administrators for this dashboard.">
        <form onSubmit={handleCreateUser} className="mb-6 grid gap-4 border-b pb-6 sm:grid-cols-3">
          <AdminField label="Display name">
            <Input value={newName} onChange={(event) => setNewName(event.target.value)} required />
          </AdminField>
          <AdminField label="Email">
            <Input
              type="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Temporary password" hint="At least 8 characters">
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
            />
          </AdminField>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating…' : 'Add admin user'}
            </Button>
          </div>
        </form>

        <ul className="flex flex-col gap-3">
          {users.map((user) => {
            const isSelf = currentUser?.id && currentUser.id === user.id;

            return (
              <li
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.displayName}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {user.active ? 'Active' : 'Disabled'}
                    {user.lastLoginAt ? ` · Last login ${new Date(user.lastLoginAt).toLocaleString()}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleResetPassword(user)}>
                    Reset password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(user)}
                    disabled={isSelf && user.active}
                  >
                    {user.active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user)}
                    disabled={isSelf}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </AdminPanel>
    </div>
  );
}
