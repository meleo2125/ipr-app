import React from "react";
import ChapterLevels from "../../../../components/ChapterLevels";

const DesignScreen = () => {
  return (
    <ChapterLevels
      chapterName="design"
      title="Design Levels"
      backgroundImage={require("../../../../assets/images/designbg.jpg")}
    />
  );
};

export default DesignScreen;
