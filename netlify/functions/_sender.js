/**
 * Shared Sender.net helper.
 *
 * The important thing this exists for: POST /v2/subscribers assigns "the new
 * groups assigned to the subscriber", which means it *replaces* their group
 * membership rather than adding to it. Used on someone who already exists, it
 * silently removes them from every other group — so a newsletter signup would
 * drop a subscriber out of the Fear of Falling funnel, and a talk signup would
 * drop them off the newsletter.
 *
 * POST /v2/subscribers/groups/{groupId} is additive and leaves other groups
 * alone, but only works on subscribers who already exist. So: try the additive
 * call first, and only create the subscriber if Sender reports them missing.
 */

const API = 'https://api.sender.net/v2';

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * Add an email to a group without disturbing any other group they are in.
 *
 * @returns {Promise<{ok: boolean, status?: 'new'|'existing', error?: string, detail?: string}>}
 *   status 'existing' = they were already a subscriber, 'new' = we just created them.
 */
async function addToGroup({ token, group, email, firstname, fields }) {
  // 1. Additive path, for anyone who already exists anywhere in the account.
  let res;
  let text;
  try {
    res = await fetch(`${API}/subscribers/groups/${encodeURIComponent(group)}`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ subscribers: [email], trigger_automation: true }),
    });
    text = await res.text();
  } catch (err) {
    return { ok: false, error: 'unreachable', detail: String(err) };
  }

  if (res.ok) {
    let missing = [];
    try {
      const body = JSON.parse(text);
      const m = body && body.message;
      missing = (m && m.non_existing_subscribers) || [];
    } catch (err) {
      // A 200 we cannot parse still means Sender accepted it.
      return { ok: true, status: 'existing' };
    }

    const isNew = missing.some(function (e) {
      return String(e).toLowerCase() === email;
    });
    if (!isNew) return { ok: true, status: 'existing' };
    // falls through to create them
  } else if (res.status !== 404 && res.status !== 422) {
    return { ok: false, error: 'group_add_failed', detail: `${res.status} ${text}` };
  }

  // 2. They do not exist yet, so create them. Safe to pass groups here: there
  //    is no existing membership to overwrite.
  const body = { email, groups: [group], trigger_automation: true };
  if (firstname) body.firstname = firstname;
  if (fields) body.fields = fields;

  try {
    res = await fetch(`${API}/subscribers`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(body),
    });
    text = await res.text();
  } catch (err) {
    return { ok: false, error: 'unreachable', detail: String(err) };
  }

  if (res.ok) return { ok: true, status: 'new' };

  // 422 here is a race: created between our two calls. They are on the list.
  if (res.status === 422) return { ok: true, status: 'existing' };

  return { ok: false, error: 'create_failed', detail: `${res.status} ${text}` };
}

module.exports = { addToGroup };
