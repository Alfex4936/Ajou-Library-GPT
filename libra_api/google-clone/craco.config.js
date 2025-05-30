const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Production optimizations
      if (env === 'production') {
        // Disable source maps for smaller bundle size
        webpackConfig.devtool = false;
        
        // Advanced optimization settings
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: -10,
              },
              mui: {
                test: /[\\/]node_modules[\\/]@mui[\\/]/,
                name: 'mui',
                chunks: 'all',
                priority: 20,
                enforce: true,
              },
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
                priority: 30,
                enforce: true,
              },
              i18n: {
                test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
                name: 'i18n',
                chunks: 'all',
                priority: 25,
                enforce: true,
              },
            },
          },
          usedExports: true,
          sideEffects: false,
          providedExports: true,
          innerGraph: true,
          mangleExports: true,
        };

        // Compression and performance plugins
        const CompressionPlugin = require('compression-webpack-plugin');
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
          })
        );

        // Add bundle analyzer (optional - comment out for normal builds)
        // const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
        // webpackConfig.plugins.push(new BundleAnalyzerPlugin());
      }      // Development optimizations - keep it simple and fast
      if (env === 'development') {
        // Fast source maps for development
        webpackConfig.devtool = 'eval-cheap-module-source-map';
        
        // Minimal optimizations for faster startup
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
          runtimeChunk: false, // Disable runtime chunk for faster startup
        };

        // Use memory cache instead of filesystem for faster startup
        webpackConfig.cache = {
          type: 'memory',
        };

        // Reduce resolver complexity for development
        webpackConfig.resolve.modules = ['node_modules'];
      }      // General optimizations for all environments
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          '@': path.resolve(__dirname, 'src'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@pages': path.resolve(__dirname, 'src/pages'),
          '@hooks': path.resolve(__dirname, 'src/hooks'),
          '@store': path.resolve(__dirname, 'src/store'),
          '@utils': path.resolve(__dirname, 'src/utils'),
          '@i18n': path.resolve(__dirname, 'src/i18n'),
          '@assets': path.resolve(__dirname, 'src/assets'),
        },
      };

      // Only add Node.js fallbacks for production builds
      if (env === 'production') {
        webpackConfig.resolve.fallback = {
          "path": require.resolve("path-browserify"),
          "os": require.resolve("os-browserify/browser"),
          "crypto": require.resolve("crypto-browserify"),
        };
      }

      // Performance optimizations
      webpackConfig.performance = {
        maxAssetSize: 512000,
        maxEntrypointSize: 512000,
        hints: env === 'production' ? 'warning' : false,
      };      return webpackConfig;
    },
  },
  // Let React Scripts handle Babel configuration by default
  devServer: {
    // Development server optimizations for faster startup
    compress: false, // Disable compression in development for faster startup
    hot: true,
    port: 3003,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'build'),
      serveIndex: false, // Disable directory browsing for faster startup
      watch: false, // Disable file watching on static files
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: false, // Disable progress for faster startup
    },
    // Minimal logging for faster startup
    devMiddleware: {
      stats: 'errors-only',
    },    // Disable HTTPS for faster startup
    server: {
      type: 'http',
    },
    // Reduce file watching
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: false,
        interval: 1000,
      },
    },
  },
};
