import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#c4432d",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 55,
            width: 76,
            height: 76,
            borderRadius: 38,
            border: "19px solid #fffefa",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 122,
            top: 111,
            width: 25,
            height: 25,
            borderRadius: 4,
            background: "#fffefa",
          }}
        />
      </div>
    ),
    size,
  );
}
