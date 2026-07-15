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

function isEditableDbUser(currentUser) {
  const id = currentUser?.id;
  return Boolean(id) && id !== 'dev-admin';
}

export function AdminProfilePanel({ currentUser, onUserUpdated }) {
  const canEdit = isEditableDbUser(currentUser);
  const [profileName, setProfileName] = useState(currentUser?.displayName ?? '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email ?? '');
  const [profileMessage, setProfileMessage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setProfileName(currentUser?.displayName ?? '');
    setProfileEmail(currentUser?.email ?? '');
    setProfileMessage('');
    setPasswordMessage('');
    setError('');
    setCurrentPassword('');
    setNextPassword('');
  }, [currentUser?.id, currentUser?.displayName, currentUser?.email]);

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

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-6">
        <AdminPanel
          title="Your profile"
          description="This session is signed in with the environment or development admin account."
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Display name</dt>
              <dd className="mt-1 font-medium text-foreground">
                {currentUser?.displayName || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium text-foreground">{currentUser?.email || '—'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            Profile edits and password changes require a database admin user (invite a user under
            Account → Users, then sign in with that account).
          </p>
        </AdminPanel>
      </div>
    );
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
    </div>
  );
}
