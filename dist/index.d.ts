import * as React from 'react';
import './globals.js';
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
export declare const Avatar: React.MemoExoticComponent<(props: Props) => React.JSX.Element>;
