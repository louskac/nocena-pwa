import React from 'react';

const ChallengeIndicator = ({ dailyChallenges, weeklyChallenges, monthlyChallenge, month }) => {
  const daysInMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();
  const weeksInMonth = getWeeksInMonth(month);
  
  // Calculate the starting index for daily challenges in the current month
  const startOfYear = new Date(new Date().getFullYear(), 0, 0);
  const startOfMonth = new Date(new Date().getFullYear(), month, 1);
  const daysSinceStartOfYear = Math.floor((startOfMonth - startOfYear) / (1000 * 60 * 60 * 24));
  
  const dailyChallengesForMonth = dailyChallenges.slice(daysSinceStartOfYear, daysSinceStartOfYear + daysInMonth);
  const weeklyChallengesForMonth = weeklyChallenges.slice(getWeekIndexForMonth(month), getWeekIndexForMonth(month) + weeksInMonth);

  const dailyRadius = 50;  // Radius for daily challenges
  const weeklyRadius = 35;  // Radius for weekly challenges
  const monthlyRadius = 15; // Radius for monthly challenge
  const margin = 4; // Margin between segments

  const renderSegments = (segments, color, totalSegments, strokeWidth, radius, segmentType) => {
    const circumference = 2 * Math.PI * radius;
    return segments.map((segment, index) => {
      const segmentLength = circumference / totalSegments;
      const strokeDasharray = `${segmentLength - margin} ${circumference - segmentLength + margin}`;
      const rotation = (index / totalSegments) * 360;
      const opacity = segment ? 1 : 0.3;

      return (
        <circle
          key={`${segmentType}-${index}`}
          r={radius}
          cx="70"
          cy="70"
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset="0"
          transform={`rotate(${rotation} 70 70)`}
          style={{ opacity }}
        />
      );
    });
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="relative">
        {/* Daily challenge segments */}
        {renderSegments(dailyChallengesForMonth, '#FD4EF5', daysInMonth, 6, dailyRadius, 'daily')}
        {/* Weekly challenge segments */}
        {renderSegments(weeklyChallengesForMonth, '#10CAFF', weeksInMonth, 10, weeklyRadius, 'weekly')}
        {/* Monthly challenge */}
        <circle
          r={monthlyRadius}
          cx="70"
          cy="70"
          fill={monthlyChallenge ? 'white' : 'rgba(255, 255, 255, 0.7)'}
        />
      </svg>
    </div>
  );
};

const getWeeksInMonth = (month) => {
  const year = new Date().getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  let weekCount = 0;

  for (let day = firstDayOfMonth; day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
    if (day.getDay() === 1) { // Checking for Mondays (change to desired week start day)
      weekCount++;
    }
  }

  return weekCount;
};

const getWeekIndexForMonth = (month) => {
  const year = new Date().getFullYear();
  let weekIndex = 0;
  for (let m = 0; m < month; m++) {
    weekIndex += getWeeksInMonth(m);
  }
  return weekIndex;
};

export default ChallengeIndicator;
