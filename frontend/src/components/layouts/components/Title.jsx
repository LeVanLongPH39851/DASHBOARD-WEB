import React from "react";

const Title = ({ title }) => {
  return (
    <h1 className="ml-2 mb-6 max-lg:mb-5 max-md:mb-4 text-lg max-lg:text-base max-md:text-sm font-semibold text-color-black-100 dark:text-color-white-90 transition-all duration-300 uppercase border-b border-border-black-10 dark:border-background-white-15 inline-block">
      {title}
    </h1>
  );
};

export default React.memo(Title);
