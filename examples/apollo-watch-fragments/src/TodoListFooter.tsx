import React from "react";
import {
  useFragment,
  shallowCompareFragmentReferences,
} from "@graphitation/apollo-react-relay-duct-tape";
import { graphql } from "@graphitation/graphql-js-tag";

import { TodoListFooter_todosFragment$key } from "./__generated__/TodoListFooter_todosFragment.graphql";

// [issue 1]: uncomment this fragment to see compiler failure (repro from 1js)
// const TestFragment = graphql`
//   fragment TodoListFooter_viewDataFragment on ViewData {
//     todoView {
//       totalCountString
//     }
//   }
// `;

const TodoListFooter: React.FC<{
  todos: TodoListFooter_todosFragment$key;
}> = ({ todos: todosRef }) => {
  const todos = useFragment(
    graphql`
      fragment TodoListFooter_todosFragment on MeWithTodos { # [issue 2]: change to NodeWithTodos to see compiler failure (repro from 1js)
        todoStats: todos(first: 0) {
          uncompletedCount
        }
      }
    `,
    todosRef,
  );
  console.log("TodoListFooter watch data:", todos);

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{todos.todoStats.uncompletedCount}</strong> item
        {todos.todoStats.uncompletedCount === 1 ? "" : "s"} left
      </span>
      {todos.todoStats.uncompletedCount === 0 && (
        <button className="clear-completed">Clear completed</button>
      )}
    </footer>
  );
};

const MemoizedTodoListFooter = React.memo(
  TodoListFooter,
  shallowCompareFragmentReferences("todos"),
);
export { MemoizedTodoListFooter as TodoListFooter };
