import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
};

export function ProgressRing({
  percent,
  size = 160,
  strokeWidth = 12,
  label,
  color = "#1f3aa5",
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <View className="absolute items-center">
        <Text
          className="font-black"
          style={{
            color,
            fontSize: size * 0.22,
            lineHeight: size * 0.24,
          }}
        >
          {percent}%
        </Text>
        {label && (
          <Text
            className="text-gray-500 font-medium"
            style={{ fontSize: size * 0.08 }}
          >
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}
