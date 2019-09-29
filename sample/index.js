import { Metadata } from '../lib/metadata-decorator';

@Metadata({
  name: 'Sample',
  thumbnail: './sample.png',
  description: 'A Sample Component',
  props: [
    { name: 'title', label: 'Title', type: 'string' },
    { name: 'message', label: 'Message', type: 'string' },
  ],
})
class SampleComponent {}

@Metadata({
  thumbnail: './sample.png',
  description: 'A Test Component',
  props: {
    title: 'string',
  },
})
class TestComponent {}
