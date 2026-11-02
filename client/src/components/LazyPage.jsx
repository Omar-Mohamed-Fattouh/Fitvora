import { Suspense } from "react";
import PageSkeleton from "./PageSkeleton";

const LazyPage = ({ children, variant = "dashboard" }) => (
  <Suspense fallback={<PageSkeleton variant={variant} />}>
    {children}
  </Suspense>
);

export default LazyPage;
