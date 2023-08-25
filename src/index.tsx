import React from "react";
import { View } from "react-native";
import { PixelRatio } from "react-native";
import { renderToStaticMarkup } from "react-dom/server";
import Image from "react-native-remote-svg";
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
	
	const svgString = renderToStaticMarkup(
	  <AvatarReact
		style={{
		  width: PixelRatio.getPixelSizeForLayoutSize(size),
		  height: PixelRatio.getPixelSizeForLayoutSize(size),
		}}
		{...props}
	  />
	);
  
	return (
	  <Image
		source={{
		  uri: `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`,
		}}
		style={{
		  width: size,
		  height: size,
		}}
	  />
	);
  });

export const Piece = React.memo((props: Props) => {
  const { pieceSize } = props;

  const svgString = renderToStaticMarkup(<PieceReact {...props} />);

  return (
    <Image
      source={{
        uri: `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`,
      }}
      style={{
        width: Number(pieceSize),
        height: Number(pieceSize),
      }}
    />
  );
});
