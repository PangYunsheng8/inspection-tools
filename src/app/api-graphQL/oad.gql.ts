import gql from 'graphql-tag';

export const GET_OADS = gql`
query {
  getOads {
    id
    major
    minor
    patch
    type
    path
    isAvailable
    lowestAvailable
    latestAvailable
    hashCode
  }
}
`

export const GET_OAD_BY_VERSION = gql`
query ($type: String!, $major: Int!, $minor: Int!, $patch: Int!) {
  getOadByVersion(type: $type, major: $major, minor: $minor, patch: $patch) {
    result {
      code
      message
    }
    oad {
      id
      major
      minor
      patch
      type
      path
      isAvailable
      lowestAvailable
      latestAvailable
      hashCode
    }
  }
}
`

export const GET_LOWEST_AVL_OAD = gql`
query ($type: String!) {
  getLowestAvlOad(type: $type) {
    result {
      code
      message
    }
    oad {
      id
      major
      minor
      patch
      type
      path
      isAvailable
      lowestAvailable
      latestAvailable
      hashCode
    }
  }
}
`

export const GET_LATEST_AVL_OAD = gql`
query ($type: String!) {
  getLatestAvlOad(type: $type) {
    result {
      code
      message
    }
    oad {
      id
      major
      minor
      patch
      type
      path
      isAvailable
      lowestAvailable
      latestAvailable
      hashCode
    }
  }
}
`