import * as React from "react";
import { SvgXml, SvgCss, SvgUri, SvgCssUri } from "react-native-svg";

import "./globals.js"; // https://github.com/facebook/hermes/issues/948#issuecomment-1484240071
import { PixelRatio } from "react-native";
import { renderToString } from "react-dom/server";
import { Avatar as AvatarReact, Piece as PieceReact } from "avataaars";

export interface Props {
  avatarStyle: string;
  size: number;
  topType?: string;
  accessoriesType?: string;
  hairColor?: string;
  facialHairType?: string;
  facialHairColor?: string;
  clotheType?: string;
  clotheColor?: string;
  graphicType?: string;
  eyeType?: string;
  eyebrowType?: string;
  mouthType?: string;
  skinColor?: string;
  pieceType?: string;
  pieceSize?: string;
}

export const Avatar = React.memo((props: Props) => {
  const { size } = props;

  const avatar = React.useMemo(
    () => (
      <AvatarReact
        style={{
          width: PixelRatio.getPixelSizeForLayoutSize(size),
          height: PixelRatio.getPixelSizeForLayoutSize(size),
        }}
        {...props}
      />
    ),
    [props]
  );

  const svgString = renderToString(avatar);

  // const encodedSvgString = `data:image/svg+xml;utf8,${encodeURIComponent(
  //   svgString
  // )}`.toString();

  // console.log(encodedSvgString);

  return <SvgXml xml={svgString} width={"100%"} height={"100%"} />;
});

// export const Piece = React.memo((props: Props) => {
//   const { pieceSize } = props;

//   const svgString = renderToString(<PieceReact {...props} />);

//   return (
//     <Image
//       source={{
//         uri: `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`,
//       }}
//       style={{
//         width: Number(pieceSize),
//         height: Number(pieceSize),
//       }}
//     />
//   );
// });
