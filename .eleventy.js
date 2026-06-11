// Eleventy config for the Bernd Küffmann site.
// Renders src/ into _site/. Static assets (css, js, assets, admin) are passed through as-is.

import yaml from 'js-yaml';

export default function (eleventyConfig) {
  // ─── YAML data files ────────────────────────────────────
  eleventyConfig.addDataExtension('yml,yaml', (contents) => yaml.load(contents));

  // ─── Passthrough copies ─────────────────────────────────
  eleventyConfig.addPassthroughCopy({ 'src/css': 'css' });
  eleventyConfig.addPassthroughCopy({ 'src/js': 'js' });
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/admin': 'admin' });
  eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });

  // ─── Engagement collection (sorted newest first) ────────
  eleventyConfig.addCollection('engagements', (collectionApi) => {
    return collectionApi
      .getFilteredByGlob('src/_engagements/*.md')
      .sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
  });

  // Featured engagements appear on the homepage
  eleventyConfig.addCollection('featuredEngagements', (collectionApi) => {
    return collectionApi
      .getFilteredByGlob('src/_engagements/*.md')
      .filter((e) => e.data.featured === true)
      .sort((a, b) => (a.data.featuredOrder ?? 999) - (b.data.featuredOrder ?? 999));
  });

  // ─── Helpful filters ────────────────────────────────────
  eleventyConfig.addFilter('year', () => new Date().getFullYear());
  eleventyConfig.addFilter('iso', (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d));

  // Watch CSS/JS during dev so the dev server reloads
  eleventyConfig.addWatchTarget('src/css/');
  eleventyConfig.addWatchTarget('src/js/');

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', '11ty.js', 'html'],
  };
}
