import React from "react";
import ChapterLevels from "../../../../components/ChapterLevels";

const CopyrightsScreen = () => {
  return (
    <ChapterLevels
      chapterName="copyrights"
      title="Copyright Levels"
      backgroundImage={require("../../../../assets/images/copyrightbg.jpg")}
    />
  );
};

export default CopyrightsScreen;
