// Mocks must be declared before imports (babel-jest hoists jest.mock() calls)

jest.mock('react-native', () => ({
  PixelRatio: {
    getPixelSizeForLayoutSize: jest.fn((size: number) => size * 2),
  },
  View: 'View',
}));

jest.mock('react-native-svg', () => ({
  SvgXml: 'SvgXml',
  SvgCss: 'SvgCss',
  SvgUri: 'SvgUri',
  SvgCssUri: 'SvgCssUri',
}));

const MOCK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 280"><g id="avatar"/></svg>';

jest.mock('react-dom/server.node', () => ({
  renderToString: jest.fn(
    () =>
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 280"><g id="avatar"/></svg>',
  ),
}));

// globals.js only sets TextEncoder — Node 18+ already has it, safe to no-op
jest.mock('../globals.js', () => {});

import * as React from 'react';
import {act, create} from 'react-test-renderer';
import {PixelRatio} from 'react-native';
import {renderToString} from 'react-dom/server.node';
import {Avatar, Props} from '../index';

// Helper: render inside act() so React 19's concurrent scheduler flushes
// synchronously, then capture toJSON() AFTER act returns (commit phase is done).
type JsonNode = {type: string; props: Record<string, any>; children: any[]};
function render(element: React.ReactElement): JsonNode {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(element);
  });
  return tree.toJSON() as JsonNode;
}

const baseProps: Props = {
  avatarStyle: 'Circle',
  size: 100,
};

describe('Avatar', () => {
  beforeEach(() => {
    (renderToString as jest.Mock).mockClear();
    (PixelRatio.getPixelSizeForLayoutSize as jest.Mock).mockClear();
  });

  describe('rendering', () => {
    it('renders without crashing with minimal required props', () => {
      expect(() => render(<Avatar {...baseProps} />)).not.toThrow();
    });

    it('renders a SvgXml element as the root output', () => {
      const json = render(<Avatar {...baseProps} />);
      expect(json.type).toBe('SvgXml');
    });

    it('renders without crashing with all optional props', () => {
      const fullProps: Props = {
        avatarStyle: 'Transparent',
        size: 64,
        topType: 'LongHairStraight',
        accessoriesType: 'Blank',
        hairColor: 'BrownDark',
        facialHairType: 'Blank',
        facialHairColor: 'Black',
        clotheType: 'BlazerShirt',
        clotheColor: 'Black',
        graphicType: 'Bat',
        eyeType: 'Default',
        eyebrowType: 'Default',
        mouthType: 'Default',
        skinColor: 'Light',
        pieceType: 'face',
        pieceSize: '64',
      };
      expect(() => render(<Avatar {...fullProps} />)).not.toThrow();
    });

    it('re-renders without crashing when props change', () => {
      let tree: ReturnType<typeof create>;
      act(() => {
        tree = create(<Avatar {...baseProps} />);
      });
      expect(() => {
        act(() => tree!.update(<Avatar {...baseProps} size={200} />));
      }).not.toThrow();
    });
  });

  describe('SvgXml props', () => {
    it('passes the SVG string returned by renderToString to SvgXml', () => {
      const json = render(<Avatar {...baseProps} />);
      expect(json.props.xml).toBe(MOCK_SVG);
    });

    it('sets width="100%" on SvgXml', () => {
      const json = render(<Avatar {...baseProps} />);
      expect(json.props.width).toBe('100%');
    });

    it('sets height="100%" on SvgXml', () => {
      const json = render(<Avatar {...baseProps} />);
      expect(json.props.height).toBe('100%');
    });

    it('updates SvgXml xml when renderToString returns a different value on re-render', () => {
      let tree!: ReturnType<typeof create>;
      act(() => {
        tree = create(<Avatar {...baseProps} />);
      });
      const newSvg = '<svg><circle r="10"/></svg>';
      (renderToString as jest.Mock).mockReturnValueOnce(newSvg);
      act(() => {
        tree.update(<Avatar {...baseProps} topType="ShortHairShortFlat" />);
      });
      const json = tree.toJSON() as JsonNode;
      expect(json.props.xml).toBe(newSvg);
    });
  });

  describe('PixelRatio usage', () => {
    it('calls PixelRatio.getPixelSizeForLayoutSize with the size prop', () => {
      render(<Avatar {...baseProps} />);
      expect(PixelRatio.getPixelSizeForLayoutSize).toHaveBeenCalledWith(100);
    });

    it('passes the correct size value for various sizes', () => {
      render(<Avatar {...baseProps} size={32} />);
      expect(PixelRatio.getPixelSizeForLayoutSize).toHaveBeenCalledWith(32);

      (PixelRatio.getPixelSizeForLayoutSize as jest.Mock).mockClear();

      render(<Avatar {...baseProps} size={256} />);
      expect(PixelRatio.getPixelSizeForLayoutSize).toHaveBeenCalledWith(256);
    });
  });

  describe('renderToString integration', () => {
    it('calls renderToString once per render', () => {
      render(<Avatar {...baseProps} />);
      expect(renderToString).toHaveBeenCalledTimes(1);
    });

    it('calls renderToString with an Avatar React element', () => {
      render(<Avatar {...baseProps} />);
      expect(renderToString).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.anything(),
          props: expect.objectContaining({
            avatarStyle: 'Circle',
          }),
        }),
      );
    });

    it('passes avatarStyle prop through to the avataaars Avatar element', () => {
      render(<Avatar avatarStyle="Transparent" size={80} />);
      const [element] = (renderToString as jest.Mock).mock.calls[0];
      expect(element.props.avatarStyle).toBe('Transparent');
    });

    it('passes optional styling props through to the avataaars Avatar element', () => {
      render(
        <Avatar
          {...baseProps}
          topType="LongHairStraight"
          hairColor="BrownDark"
          skinColor="Light"
          eyeType="Default"
          mouthType="Default"
        />,
      );
      const [element] = (renderToString as jest.Mock).mock.calls[0];
      expect(element.props.topType).toBe('LongHairStraight');
      expect(element.props.hairColor).toBe('BrownDark');
      expect(element.props.skinColor).toBe('Light');
      expect(element.props.eyeType).toBe('Default');
      expect(element.props.mouthType).toBe('Default');
    });

    it('calls renderToString again when avatar props change', () => {
      let tree: ReturnType<typeof create>;
      act(() => {
        tree = create(<Avatar {...baseProps} />);
      });
      expect(renderToString).toHaveBeenCalledTimes(1);

      act(() => {
        tree!.update(<Avatar {...baseProps} topType="ShortHairShortFlat" />);
      });
      expect(renderToString).toHaveBeenCalledTimes(2);
    });
  });
});
