import { GraphQLResolveInfo } from 'graphql';
import { TodoData } from '../db';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AddTodoInput = {
  description: Scalars['String'];
};

export type AddTodoPayload = {
  __typename?: 'AddTodoPayload';
  todoEdge?: Maybe<TodosConnectionEdge>;
  todos: TodosConnection;
};

export type ChangeTodoStatusInput = {
  id: Scalars['ID'];
  isCompleted: Scalars['Boolean'];
};

export type ChangeTodoStatusPayload = {
  __typename?: 'ChangeTodoStatusPayload';
  todo: Todo;
  todos: TodosConnection;
};

export type MeWithTodos = Node & NodeWithTodos & {
  __typename?: 'MeWithTodos';
  id: Scalars['ID'];
  todos: TodosConnection;
};


export type MeWithTodosTodosArgs = {
  after?: Maybe<Scalars['String']>;
  first: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addTodo?: Maybe<AddTodoPayload>;
  changeTodoStatus?: Maybe<ChangeTodoStatusPayload>;
};


export type MutationAddTodoArgs = {
  input: AddTodoInput;
};


export type MutationChangeTodoStatusArgs = {
  input: ChangeTodoStatusInput;
};

export type Node = {
  id: Scalars['ID'];
};

export type NodeWithTodos = {
  id: Scalars['ID'];
  todos: TodosConnection;
};


export type NodeWithTodosTodosArgs = {
  after?: Maybe<Scalars['String']>;
  first: Scalars['Int'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  meWithTodos: MeWithTodos;
  node?: Maybe<Node>;
  viewData: ViewData;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};

export type Todo = Node & {
  __typename?: 'Todo';
  description: Scalars['String'];
  id: Scalars['ID'];
  isCompleted: Scalars['Boolean'];
  someOtherField: Scalars['String'];
};

export type TodoViewData = {
  __typename?: 'TodoViewData';
  totalCountString: Scalars['String'];
  uncompletedCountString: Scalars['String'];
};

export type TodosConnection = Node & {
  __typename?: 'TodosConnection';
  edges: Array<TodosConnectionEdge>;
  id: Scalars['ID'];
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
  uncompletedCount: Scalars['Int'];
};

export type TodosConnectionEdge = {
  __typename?: 'TodosConnectionEdge';
  cursor: Scalars['String'];
  node: Todo;
};

export type ViewData = {
  __typename?: 'ViewData';
  todoView: TodoViewData;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddTodoInput: ResolverTypeWrapper<Partial<AddTodoInput>>;
  AddTodoPayload: ResolverTypeWrapper<Partial<Omit<AddTodoPayload, 'todoEdge' | 'todos'> & { todoEdge?: Maybe<ResolversTypes['TodosConnectionEdge']>, todos: ResolversTypes['TodosConnection'] }>>;
  Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>;
  ChangeTodoStatusInput: ResolverTypeWrapper<Partial<ChangeTodoStatusInput>>;
  ChangeTodoStatusPayload: ResolverTypeWrapper<Partial<Omit<ChangeTodoStatusPayload, 'todo' | 'todos'> & { todo: ResolversTypes['Todo'], todos: ResolversTypes['TodosConnection'] }>>;
  ID: ResolverTypeWrapper<Partial<Scalars['ID']>>;
  Int: ResolverTypeWrapper<Partial<Scalars['Int']>>;
  MeWithTodos: ResolverTypeWrapper<Partial<Omit<MeWithTodos, 'todos'> & { todos: ResolversTypes['TodosConnection'] }>>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['MeWithTodos'] | ResolversTypes['Todo'] | ResolversTypes['TodosConnection'];
  NodeWithTodos: ResolversTypes['MeWithTodos'];
  PageInfo: ResolverTypeWrapper<Partial<PageInfo>>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Partial<Scalars['String']>>;
  Todo: ResolverTypeWrapper<TodoData>;
  TodoViewData: ResolverTypeWrapper<Partial<TodoViewData>>;
  TodosConnection: ResolverTypeWrapper<Partial<Omit<TodosConnection, 'edges'> & { edges: Array<ResolversTypes['TodosConnectionEdge']> }>>;
  TodosConnectionEdge: ResolverTypeWrapper<Partial<Omit<TodosConnectionEdge, 'node'> & { node: ResolversTypes['Todo'] }>>;
  ViewData: ResolverTypeWrapper<Partial<ViewData>>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddTodoInput: Partial<AddTodoInput>;
  AddTodoPayload: Partial<Omit<AddTodoPayload, 'todoEdge' | 'todos'> & { todoEdge?: Maybe<ResolversParentTypes['TodosConnectionEdge']>, todos: ResolversParentTypes['TodosConnection'] }>;
  Boolean: Partial<Scalars['Boolean']>;
  ChangeTodoStatusInput: Partial<ChangeTodoStatusInput>;
  ChangeTodoStatusPayload: Partial<Omit<ChangeTodoStatusPayload, 'todo' | 'todos'> & { todo: ResolversParentTypes['Todo'], todos: ResolversParentTypes['TodosConnection'] }>;
  ID: Partial<Scalars['ID']>;
  Int: Partial<Scalars['Int']>;
  MeWithTodos: Partial<Omit<MeWithTodos, 'todos'> & { todos: ResolversParentTypes['TodosConnection'] }>;
  Mutation: {};
  Node: ResolversParentTypes['MeWithTodos'] | ResolversParentTypes['Todo'] | ResolversParentTypes['TodosConnection'];
  NodeWithTodos: ResolversParentTypes['MeWithTodos'];
  PageInfo: Partial<PageInfo>;
  Query: {};
  String: Partial<Scalars['String']>;
  Todo: TodoData;
  TodoViewData: Partial<TodoViewData>;
  TodosConnection: Partial<Omit<TodosConnection, 'edges'> & { edges: Array<ResolversParentTypes['TodosConnectionEdge']> }>;
  TodosConnectionEdge: Partial<Omit<TodosConnectionEdge, 'node'> & { node: ResolversParentTypes['Todo'] }>;
  ViewData: Partial<ViewData>;
};

export type AddTodoPayloadResolvers<ContextType = any, ParentType = ResolversParentTypes['AddTodoPayload']> = {
  todoEdge?: Resolver<Maybe<ResolversTypes['TodosConnectionEdge']>, ParentType, ContextType>;
  todos?: Resolver<ResolversTypes['TodosConnection'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChangeTodoStatusPayloadResolvers<ContextType = any, ParentType = ResolversParentTypes['ChangeTodoStatusPayload']> = {
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  todos?: Resolver<ResolversTypes['TodosConnection'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeWithTodosResolvers<ContextType = any, ParentType = ResolversParentTypes['MeWithTodos']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  todos?: Resolver<ResolversTypes['TodosConnection'], ParentType, ContextType, RequireFields<MeWithTodosTodosArgs, 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType = ResolversParentTypes['Mutation']> = {
  addTodo?: Resolver<Maybe<ResolversTypes['AddTodoPayload']>, ParentType, ContextType, RequireFields<MutationAddTodoArgs, 'input'>>;
  changeTodoStatus?: Resolver<Maybe<ResolversTypes['ChangeTodoStatusPayload']>, ParentType, ContextType, RequireFields<MutationChangeTodoStatusArgs, 'input'>>;
};

export type NodeResolvers<ContextType = any, ParentType = ResolversParentTypes['Node']> = {
  __resolveType: TypeResolveFn<'MeWithTodos' | 'Todo' | 'TodosConnection', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type NodeWithTodosResolvers<ContextType = any, ParentType = ResolversParentTypes['NodeWithTodos']> = {
  __resolveType: TypeResolveFn<'MeWithTodos', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  todos?: Resolver<ResolversTypes['TodosConnection'], ParentType, ContextType, RequireFields<NodeWithTodosTodosArgs, 'first'>>;
};

export type PageInfoResolvers<ContextType = any, ParentType = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType = ResolversParentTypes['Query']> = {
  meWithTodos?: Resolver<ResolversTypes['MeWithTodos'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  viewData?: Resolver<ResolversTypes['ViewData'], ParentType, ContextType>;
};

export type TodoResolvers<ContextType = any, ParentType = ResolversParentTypes['Todo']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  someOtherField?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TodoViewDataResolvers<ContextType = any, ParentType = ResolversParentTypes['TodoViewData']> = {
  totalCountString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uncompletedCountString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TodosConnectionResolvers<ContextType = any, ParentType = ResolversParentTypes['TodosConnection']> = {
  edges?: Resolver<Array<ResolversTypes['TodosConnectionEdge']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  uncompletedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TodosConnectionEdgeResolvers<ContextType = any, ParentType = ResolversParentTypes['TodosConnectionEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ViewDataResolvers<ContextType = any, ParentType = ResolversParentTypes['ViewData']> = {
  todoView?: Resolver<ResolversTypes['TodoViewData'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AddTodoPayload?: AddTodoPayloadResolvers<ContextType>;
  ChangeTodoStatusPayload?: ChangeTodoStatusPayloadResolvers<ContextType>;
  MeWithTodos?: MeWithTodosResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  NodeWithTodos?: NodeWithTodosResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoViewData?: TodoViewDataResolvers<ContextType>;
  TodosConnection?: TodosConnectionResolvers<ContextType>;
  TodosConnectionEdge?: TodosConnectionEdgeResolvers<ContextType>;
  ViewData?: ViewDataResolvers<ContextType>;
};

