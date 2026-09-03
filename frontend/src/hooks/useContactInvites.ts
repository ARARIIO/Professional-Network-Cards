import { useMutation, useQuery } from '@apollo/client/react';
import {
  INCOMING_CONTACT_INVITES,
  OUTGOING_CONTACT_INVITES,
  RESPOND_CONTACT_INVITE,
  SEND_CONTACT_INVITE,
} from '../graphql/mutations/contact-invite';
import type { ContactInvite } from '../graphql/types';
import { useAuth } from './useAuth';

type IncomingData = {
  incomingContactInvites: ContactInvite[];
};

type OutgoingData = {
  outgoingContactInvites: ContactInvite[];
};

export function useContactInvites() {
  const { user } = useAuth();
  const incoming = useQuery<IncomingData>(INCOMING_CONTACT_INVITES, {
    skip: user === null,
    fetchPolicy: 'network-only',
  });
  const outgoing = useQuery<OutgoingData>(OUTGOING_CONTACT_INVITES, {
    skip: user === null,
    fetchPolicy: 'network-only',
  });
  const [sendInvite] = useMutation(SEND_CONTACT_INVITE);
  const [respondInvite] = useMutation(RESPOND_CONTACT_INVITE);

  const incomingList =
    incoming.data === null ||
    typeof incoming.data !== 'object' ||
    Array.isArray(incoming.data.incomingContactInvites) === false
      ? []
      : incoming.data.incomingContactInvites;
  const outgoingList =
    outgoing.data === null ||
    typeof outgoing.data !== 'object' ||
    Array.isArray(outgoing.data.outgoingContactInvites) === false
      ? []
      : outgoing.data.outgoingContactInvites;

  return {
    incoming: incomingList,
    outgoing: outgoingList,
    loading: incoming.loading || outgoing.loading,
    sendInvite: async (sourceSlug: string) => {
      await sendInvite({ variables: { sourceSlug } });
      await outgoing.refetch();
    },
    respondInvite: async (id: string, accept: boolean) => {
      await respondInvite({ variables: { id, accept } });
      await incoming.refetch();
      await outgoing.refetch();
    },
    refetch: async () => {
      await incoming.refetch();
      await outgoing.refetch();
    },
  };
}

export function inviteStatusForSlug(
  outgoing: ContactInvite[],
  slug: string,
): string {
  for (const invite of outgoing) {
    if (invite.cardSlug === slug) {
      return invite.status;
    }
  }
  return 'none';
}
