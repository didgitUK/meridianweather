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

export function AdminUsersPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  async function refresh() {
    const [usersPayload, invitesPayload] = await Promise.all([
      parseJson(await fetch('/api/admin/users')),
      parseJson(await fetch('/api/admin/users/invite')),
    ]);
    setUsers(usersPayload.users ?? []);
    setInvites(invitesPayload.invites ?? []);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await refresh();
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

  async function handleInvite(event) {
    event.preventDefault();
    setIsInviting(true);
    setError('');
    setStatus('');

    try {
      await parseJson(
        await fetch('/api/admin/users/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: newName,
            email: newEmail,
          }),
        }),
      );
      setNewName('');
      setNewEmail('');
      setStatus('Invite email sent.');
      await refresh();
    } catch (inviteError) {
      setError(inviteError.message);
    } finally {
      setIsInviting(false);
    }
  }

  async function handleResendInvite(invite) {
    setError('');
    setStatus('');
    try {
      await parseJson(
        await fetch('/api/admin/users/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: invite.displayName,
            email: invite.email,
            resend: true,
          }),
        }),
      );
      setStatus(`Invite resent to ${invite.email}.`);
      await refresh();
    } catch (resendError) {
      setError(resendError.message);
    }
  }

  async function handleRevokeInvite(invite) {
    if (!window.confirm(`Revoke invite for ${invite.email}?`)) {
      return;
    }

    setError('');
    try {
      await parseJson(
        await fetch('/api/admin/users/invite', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: invite.id }),
        }),
      );
      await refresh();
    } catch (revokeError) {
      setError(revokeError.message);
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
      await refresh();
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
      await refresh();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading admin users…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <AdminPanel
        title="Invite admin"
        description="Send an email invite. Admins set their own password when they accept."
      >
        <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isInviting}>
              {isInviting ? 'Sending invite…' : 'Send invite'}
            </Button>
          </div>
        </form>
      </AdminPanel>

      {invites.length > 0 ? (
        <AdminPanel title="Pending invites" description="Invites expire after 72 hours.">
          <ul className="flex flex-col gap-3">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{invite.displayName}</p>
                  <p className="truncate text-sm text-muted-foreground">{invite.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expires {new Date(invite.expiresAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleResendInvite(invite)}>
                    Resend
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleRevokeInvite(invite)}>
                    Revoke
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}

      <AdminPanel title="Admin users" description="Active and disabled administrators.">
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
