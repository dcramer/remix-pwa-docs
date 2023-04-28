import { mdxToHtml } from "~/utils/server/mdx.server";
import { ClientOnly } from "remix-utils";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

import type { LoaderArgs } from "@remix-run/node";
import { getPostContent } from "~/utils/server/github.server";
import Skeleton from "~/components/layout/Skeleton";
import { Doc } from "~/components/layout/Documentation";
import type { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { typedjson } from "remix-typedjson";
import { RequireParam } from "~/utils/ParamHelpers";
import SwSlugError from "./SwSlugError";

export const loader = async ({ params }: LoaderArgs) => {
  const slug = RequireParam(params, "slug");

  const doc = await getPostContent(slug, "sw");
  if (!doc) {
    console.error(`Invalid slug: ${slug}`);
    throw typedjson(null, { status: 404, statusText: "Oops! This page could not be found." });
  }

  const code = await mdxToHtml(doc);

  return typedjson(code, 200);
};

export default function DocPage() {
  return <ClientOnly fallback={<Skeleton />} children={() => <Doc />} />;
}

export const ErrorBoundary: V2_ErrorBoundaryComponent = () => {
  let error = useRouteError();
  if (isRouteErrorResponse(error)) return <SwSlugError status={error.status} statusText={error.statusText} />;
  if (error instanceof Error)
    return <SwSlugError status={500} statusText={`Message: ${error.message}. Stack: ${error.stack}`} />;
  return <h1>An Unknown Error Occurred</h1>;
};
