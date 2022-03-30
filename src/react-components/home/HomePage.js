import React, { useContext, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { createAndRedirectToNewHub } from "../../utils/phoenix-utils";
import { SelectRoom } from "../../SelectRoom";

export function HomePage() {
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    // Support legacy sign in urls.
    if (qs.has("sign_in")) {
      const redirectUrl = new URL("/signin", window.location);
      redirectUrl.search = location.search;
      window.location = redirectUrl;
    } else if (qs.has("auth_topic")) {
      const redirectUrl = new URL("/verify", window.location);
      redirectUrl.search = location.search;
      window.location = redirectUrl;
    }

    if (qs.has("new")) {
      createAndRedirectToNewHub(null, null, true);
    }

  }, []);

  return (     
    <SelectRoom />
  );
}
