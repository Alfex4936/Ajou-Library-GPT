import Timeline from "@material-ui/lab/Timeline";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import React from "react";

export default function History({ searchHistory }) {
  // console.log(searchHistory);
  if (searchHistory.length === 0) {
    return <p>No search history yet.</p>;
  }

  return (
    <Timeline align="alternate">
      {searchHistory.map((searchItem, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color={index % 2 === 0 ? "primary" : "secondary"} />
            {index < searchHistory.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>{searchItem}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
