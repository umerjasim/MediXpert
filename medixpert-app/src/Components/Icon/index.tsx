import React from "react";
import Icons from "../../Global/Icons";

interface DynamicIconProps {
  name: string;
  size?: string | number;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size}) => {
  const IconComponent = Icons[name] || Icons['QuestionCircleFilled'];

  return (
    <span style={size ? { fontSize: size } : undefined}>
      <IconComponent />
    </span>
  );
};

export default DynamicIcon;