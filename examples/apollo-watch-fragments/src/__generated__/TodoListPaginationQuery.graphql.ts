/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { FragmentRefs } from "@graphitation/apollo-react-relay-duct-tape";
export type TodoListPaginationQueryVariables = {
    after: string;
    count: number;
    includeSomeOtherField?: boolean | null | undefined;
    id: string;
};
export type TodoListPaginationQueryResponse = {
    readonly node: {
        readonly " $fragmentRefs": FragmentRefs<"TodoList_queryFragment">;
    } | null;
};
export type TodoListPaginationQuery = {
    readonly response: TodoListPaginationQueryResponse;
    readonly variables: TodoListPaginationQueryVariables;
};


/*
query TodoListPaginationQuery($after: String! = "", $count: Int! = 5, $includeSomeOtherField: Boolean, $id: ID!) {
  node(id: $id) {
    __typename
    ...TodoList_queryFragment_2QE1um
    id
  }
}

fragment TodoList_queryFragment_2QE1um on NodeWithTodos {
  __isNodeWithTodos: __typename
  todos(first: $count, after: $after) @connection(key: "TodosList_todos") {
    edges {
      node {
        id
        isCompleted
        ...Todo_todoFragment
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
    id
  }
  id
}

fragment Todo_todoFragment on Todo {
  id
  description
  isCompleted
  someOtherField @include(if: $includeSomeOtherField)
}
*/

/*
query TodoListPaginationQuery($after: String! = "", $count: Int! = 5, $includeSomeOtherField: Boolean, $id: ID!) {
  node(id: $id) {
    __typename
    ...TodoList_queryFragment_2QE1um
    id
  }
}

fragment TodoList_queryFragment_2QE1um on NodeWithTodos {
  __isNodeWithTodos: __typename
  todos(first: $count, after: $after) @connection(key: "TodosList_todos") {
    edges {
      node {
        id
        isCompleted
        __typename
        ... on Node {
          __fragments @client
        }
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
    id
  }
  id
}
*/

export const documents: import("@graphitation/apollo-react-relay-duct-tape-compiler").CompiledArtefactModule = (function(){
var v0 = {
  "kind": "Name",
  "value": "after"
},
v1 = {
  "kind": "Variable",
  "name": (v0/*: any*/)
},
v2 = {
  "kind": "Variable",
  "name": {
    "kind": "Name",
    "value": "count"
  }
},
v3 = {
  "kind": "Variable",
  "name": {
    "kind": "Name",
    "value": "includeSomeOtherField"
  }
},
v4 = {
  "kind": "Name",
  "value": "id"
},
v5 = {
  "kind": "Variable",
  "name": (v4/*: any*/)
},
v6 = {
  "kind": "Name",
  "value": "node"
},
v7 = {
  "kind": "Name",
  "value": "__typename"
},
v8 = {
  "kind": "Field",
  "name": (v7/*: any*/)
},
v9 = {
  "kind": "Name",
  "value": "TodoList_queryFragment_2QE1um"
},
v10 = {
  "kind": "Field",
  "name": (v4/*: any*/)
},
v11 = {
  "kind": "OperationDefinition",
  "operation": "query",
  "name": {
    "kind": "Name",
    "value": "TodoListPaginationQuery"
  },
  "variableDefinitions": [
    {
      "kind": "VariableDefinition",
      "variable": (v1/*: any*/),
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "String"
          }
        }
      },
      "defaultValue": {
        "kind": "StringValue",
        "value": "",
        "block": false
      }
    },
    {
      "kind": "VariableDefinition",
      "variable": (v2/*: any*/),
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Int"
          }
        }
      },
      "defaultValue": {
        "kind": "IntValue",
        "value": "5"
      }
    },
    {
      "kind": "VariableDefinition",
      "variable": (v3/*: any*/),
      "type": {
        "kind": "NamedType",
        "name": {
          "kind": "Name",
          "value": "Boolean"
        }
      }
    },
    {
      "kind": "VariableDefinition",
      "variable": (v5/*: any*/),
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "ID"
          }
        }
      }
    }
  ],
  "selectionSet": {
    "kind": "SelectionSet",
    "selections": [
      {
        "kind": "Field",
        "name": (v6/*: any*/),
        "arguments": [
          {
            "kind": "Argument",
            "name": (v4/*: any*/),
            "value": (v5/*: any*/)
          }
        ],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [
            (v8/*: any*/),
            {
              "kind": "FragmentSpread",
              "name": (v9/*: any*/)
            },
            (v10/*: any*/)
          ]
        }
      }
    ]
  }
},
v12 = {
  "kind": "NamedType",
  "name": {
    "kind": "Name",
    "value": "NodeWithTodos"
  }
},
v13 = {
  "kind": "Field",
  "alias": {
    "kind": "Name",
    "value": "__isNodeWithTodos"
  },
  "name": (v7/*: any*/)
},
v14 = {
  "kind": "Name",
  "value": "todos"
},
v15 = [
  {
    "kind": "Argument",
    "name": {
      "kind": "Name",
      "value": "first"
    },
    "value": (v2/*: any*/)
  },
  {
    "kind": "Argument",
    "name": (v0/*: any*/),
    "value": (v1/*: any*/)
  }
],
v16 = [
  {
    "kind": "Directive",
    "name": {
      "kind": "Name",
      "value": "connection"
    },
    "arguments": [
      {
        "kind": "Argument",
        "name": {
          "kind": "Name",
          "value": "key"
        },
        "value": {
          "kind": "StringValue",
          "value": "TodosList_todos",
          "block": false
        }
      }
    ]
  }
],
v17 = {
  "kind": "Name",
  "value": "edges"
},
v18 = {
  "kind": "Field",
  "name": {
    "kind": "Name",
    "value": "isCompleted"
  }
},
v19 = {
  "kind": "Name",
  "value": "Todo_todoFragment"
},
v20 = {
  "kind": "Field",
  "name": {
    "kind": "Name",
    "value": "cursor"
  }
},
v21 = {
  "kind": "Field",
  "name": {
    "kind": "Name",
    "value": "pageInfo"
  },
  "selectionSet": {
    "kind": "SelectionSet",
    "selections": [
      {
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "endCursor"
        }
      },
      {
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "hasNextPage"
        }
      }
    ]
  }
};
return {
  "executionQueryDocument": {
    "kind": "Document",
    "definitions": [
      (v11/*: any*/),
      {
        "kind": "FragmentDefinition",
        "name": (v9/*: any*/),
        "typeCondition": (v12/*: any*/),
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [
            (v13/*: any*/),
            {
              "kind": "Field",
              "name": (v14/*: any*/),
              "arguments": (v15/*: any*/),
              "directives": (v16/*: any*/),
              "selectionSet": {
                "kind": "SelectionSet",
                "selections": [
                  {
                    "kind": "Field",
                    "name": (v17/*: any*/),
                    "selectionSet": {
                      "kind": "SelectionSet",
                      "selections": [
                        {
                          "kind": "Field",
                          "name": (v6/*: any*/),
                          "selectionSet": {
                            "kind": "SelectionSet",
                            "selections": [
                              (v10/*: any*/),
                              (v18/*: any*/),
                              {
                                "kind": "FragmentSpread",
                                "name": (v19/*: any*/)
                              },
                              (v8/*: any*/)
                            ]
                          }
                        },
                        (v20/*: any*/)
                      ]
                    }
                  },
                  (v21/*: any*/),
                  (v10/*: any*/)
                ]
              }
            },
            (v10/*: any*/)
          ]
        }
      },
      {
        "kind": "FragmentDefinition",
        "name": (v19/*: any*/),
        "typeCondition": {
          "kind": "NamedType",
          "name": {
            "kind": "Name",
            "value": "Todo"
          }
        },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [
            (v10/*: any*/),
            {
              "kind": "Field",
              "name": {
                "kind": "Name",
                "value": "description"
              }
            },
            (v18/*: any*/),
            {
              "kind": "Field",
              "name": {
                "kind": "Name",
                "value": "someOtherField"
              },
              "directives": [
                {
                  "kind": "Directive",
                  "name": {
                    "kind": "Name",
                    "value": "include"
                  },
                  "arguments": [
                    {
                      "kind": "Argument",
                      "name": {
                        "kind": "Name",
                        "value": "if"
                      },
                      "value": (v3/*: any*/)
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  },
  "watchQueryDocument": {
    "kind": "Document",
    "definitions": [
      (v11/*: any*/),
      {
        "kind": "FragmentDefinition",
        "name": (v9/*: any*/),
        "typeCondition": (v12/*: any*/),
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [
            (v13/*: any*/),
            {
              "kind": "Field",
              "name": (v14/*: any*/),
              "arguments": (v15/*: any*/),
              "directives": (v16/*: any*/),
              "selectionSet": {
                "kind": "SelectionSet",
                "selections": [
                  {
                    "kind": "Field",
                    "name": (v17/*: any*/),
                    "selectionSet": {
                      "kind": "SelectionSet",
                      "selections": [
                        {
                          "kind": "Field",
                          "name": (v6/*: any*/),
                          "selectionSet": {
                            "kind": "SelectionSet",
                            "selections": [
                              (v10/*: any*/),
                              (v18/*: any*/),
                              (v8/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "typeCondition": {
                                  "kind": "NamedType",
                                  "name": {
                                    "kind": "Name",
                                    "value": "Node"
                                  }
                                },
                                "selectionSet": {
                                  "kind": "SelectionSet",
                                  "selections": [
                                    {
                                      "kind": "Field",
                                      "name": {
                                        "kind": "Name",
                                        "value": "__fragments"
                                      },
                                      "directives": [
                                        {
                                          "kind": "Directive",
                                          "name": {
                                            "kind": "Name",
                                            "value": "client"
                                          }
                                        }
                                      ]
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        },
                        (v20/*: any*/)
                      ]
                    }
                  },
                  (v21/*: any*/),
                  (v10/*: any*/)
                ]
              }
            },
            (v10/*: any*/)
          ]
        }
      }
    ]
  },
  "metadata": {
    "rootSelection": "node",
    "mainFragment": {
      "name": "TodoList_queryFragment_2QE1um",
      "typeCondition": "NodeWithTodos"
    },
    "connection": {
      "selectionPath": [
        "todos"
      ],
      "forwardCountVariable": "count",
      "forwardCursorVariable": "after"
    }
  }
};
})();

export default documents;