import React from "react";
import ChapterLevels from "../../../../components/ChapterLevels";

const PatentScreen = () => {
  return (
    <ChapterLevels
      chapterName="patent"
      title="Patent Levels"
      backgroundImage={require("../../../../assets/images/patentbg.png")}
    />
  );
};

export default PatentScreen;
