import React from "react";

const CardSkeleton = () => (
  <div className="page-loading__card">
    <div className="page-loading__card-image" />
    <div className="page-loading__card-line1" />
    <div className="page-loading__card-line2" />
    <div className="page-loading__card-line3" />
  </div>
);

const HomeLoading = () => (
  <div className="page-loading">
    <header className="page-loading__header">
      <div className="page-loading__header-bar" />
      <div className="page-loading__header-line" />
    </header>
    <main className="page-loading__main">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </main>
  </div>
);

export default HomeLoading;
