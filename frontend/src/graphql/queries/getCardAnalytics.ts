import { gql } from '@apollo/client';

export const GET_CARD_ANALYTICS = gql`
  query CardAnalytics {
    cardAnalytics {
      totalViews
      lastSevenDaysViews {
        date
        count
      }
      recentViewers {
        viewedAt
        ipAddress
        userAgent
      }
    }
  }
`;
