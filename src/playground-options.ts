import dedent from 'dedent';

export const playgroundOptions = {
  tabs: [
    {
      name: 'Gateway',
      endpoint: 'http://localhost:4000/graphql',
      query: dedent`
          query PetWithComments {
            findPetsByStatus(status:"sold") {
              name
              comments {
                title
              }
            }
          } 
        `,
    },
    {
      name: 'Swagger server',
      endpoint: 'http://localhost:4001/graphql',
      query: dedent`
          query PetInfo {
            findPetsByStatus(status:"sold") {
              name
            }
          } 
          
          query FederationInfo {
            _service {
              sdl
            }
          }
        `,
    },
    {
      name: 'Comments server',
      endpoint: 'http://localhost:4002/graphql',
      query: dedent`
        query Comment {
          getPetWithCommentsById(petId: "1234") {
            comments {
              title
            }
          }
        }
        
        query FederationInfo {
          _service {
            sdl
          }
          _entities(representations: { __typename: "Pet", id: "123" }) {
            ... on Pet {
              comments {
                title
              }
            }
          }
        }
        `,
    },
  ],
};
