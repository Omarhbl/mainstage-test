import test from 'node:test';
import assert from 'node:assert/strict';
import {responsiveImageUrl, responsiveImageProps} from '../src/lib/responsive-images.ts';
const source = 'https://res.cloudinary.com/docbnheap/image/upload/v123/portrait.png';
test('delivers a smaller image without changing the original crop or asset', () => {
  assert.equal(responsiveImageUrl(source, 640), 'https://res.cloudinary.com/docbnheap/image/upload/c_limit,w_640/q_auto/f_auto/v123/portrait.png');
  const props = responsiveImageProps(source, '100vw', 1920);
  assert.equal(props.sizes, '100vw');
  assert.match(props.srcSet, /640w/);
  assert.match(props.srcSet, /1920w/);
});
test('does not rewrite signed, animated, or unrecognized media', () => {
  for (const url of [source+'?signature=abc', source.replace('/v123/', '/s--signature--/v123/'), source.replace('.png','.gif'), '/image.jpg', 'https://scontent.cdninstagram.com/image.jpg?token=abc', 'https://example.com/photo.jpg']) assert.deepEqual(responsiveImageProps(url,'100vw'), {src:url});
});
test('bounds image sizes and preserves the existing Vogue crop', () => {
  assert.match(responsiveImageUrl(source, 99999), /w_1920/);
  assert.equal(responsiveImageUrl('https://media.vogue.fr/photos/id/2:3/w_2560%2Cc_limit/photo',640), 'https://media.vogue.fr/photos/id/2:3/w_640%2Cc_limit/photo');
});
