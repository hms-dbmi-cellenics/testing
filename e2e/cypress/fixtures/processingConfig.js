module.exports = [
  {
    name: 'classifier',
    body: {
      filterSettings: {
        FDR: 0.1,
      },
      enabled: false,
      auto: false,
    },
  },
  {
    name: 'cellSizeDistribution',
    body: {
      filterSettings: {
        binStep: 200,
        minCellSize: 1080,
      },
      enabled: true,
      auto: true,
    },
  },
  {
    name: 'mitochondrialContent',
    body: {
      filterSettings: {
        method: 'absolute_threshold',
        methodSettings: {
          absolute_threshold: {
            binStep: 0.05,
            maxFraction: 0.1,
          },
        },
        minCellSize: 420,
      },
      enabled: true,
      auto: true,
    },
  },
  {
    name: 'numGenesVsNumUmis',
    body: {
      filterSettings: {
        regressionTypeSettings: {
          gam: {
            'p.level': 0.001,
          },
        },
        regressionType: 'gam',
      },
      enabled: true,
      auto: true,
    },
  },
  {
    name: 'doubletScores',
    body: {
      filterSettings: {
        probabilityThreshold: 0.5,
        binStep: 0.05,
      },
      enabled: true,
      auto: true,
    },
  },
  {
    name: 'dataIntegration',
    body: {
      dataIntegration: {
        method: 'seuratv4',
        methodSettings: {
          seuratv4: {
            normalization: 'logNormalize',
            normalisation: 'logNormalize',
            numGenes: 2000,
          },
        },
      },
      dimensionalityReduction: {
        excludeGeneCategories: [],
        method: 'rpca',
        numPCs: 30,
      },
      auto: false,
    },
  },
  {
    name: 'configureEmbedding',
    body: {
      clusteringSettings: {
        method: 'louvain',
        methodSettings: {
          louvain: {
            resolution: 0.5,
          },
        },
      },
      embeddingSettings: {
        method: 'umap',
        methodSettings: {
          tsne: {
            perplexity: 30,
            learningRate: 200,
          },
          umap: {
            minimumDistance: 0.3,
            distanceMetric: 'euclidean',
          },
        },
      },
      auto: false,
    },
  },
];
