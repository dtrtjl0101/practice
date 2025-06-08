import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import State from "../../states";
import { useEffect } from "react";

export default function useInvalidateQueriesOnAuthChange() {
  const queryClient = useQueryClient();
  const user = useAtomValue(State.Auth.user);

  useEffect(() => {
    queryClient.cancelQueries();
    queryClient.invalidateQueries();
  }, [user, queryClient]);
}
