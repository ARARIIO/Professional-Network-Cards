import { gql } from '@apollo/client';

export const INCOMING_CONTACT_INVITES = gql`
  query IncomingContactInvites {
    incomingContactInvites {
      id
      status
      fromName
      fromEmail
      cardName
      cardSlug
      createdAt
    }
  }
`;

export const OUTGOING_CONTACT_INVITES = gql`
  query OutgoingContactInvites {
    outgoingContactInvites {
      id
      status
      fromName
      fromEmail
      cardName
      cardSlug
      createdAt
    }
  }
`;

export const SEND_CONTACT_INVITE = gql`
  mutation SendContactInvite($sourceSlug: String!) {
    sendContactInvite(sourceSlug: $sourceSlug) {
      id
      status
      cardSlug
    }
  }
`;

export const RESPOND_CONTACT_INVITE = gql`
  mutation RespondContactInvite($id: String!, $accept: Boolean!) {
    respondContactInvite(id: $id, accept: $accept) {
      id
      status
    }
  }
`;
