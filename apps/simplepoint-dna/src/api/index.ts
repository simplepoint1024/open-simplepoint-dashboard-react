import {contextPath} from '@/services';

export default {
  'platform.dna-drivers': {
    baseUrl: `${contextPath}/platform/dna/drivers`,
    i18nNamespaces: ['dna-drivers'],
    name: 'dna-drivers'
  },
  'platform.dna-data-sources': {
    baseUrl: `${contextPath}/platform/dna/data-sources`,
    i18nNamespaces: ['dna-data-sources'],
    name: 'dna-data-sources'
  },
  'platform.dna-metadata': {
    baseUrl: `${contextPath}/platform/dna/metadata`,
    i18nNamespaces: ['dna-metadata'],
    name: 'dna-metadata'
  },
  'platform.dna-dialects': {
    baseUrl: `${contextPath}/platform/dna/dialects`,
    i18nNamespaces: ['dna-dialects'],
    name: 'dna-dialects'
  },
  'platform.dna-federation-catalogs': {
    baseUrl: `${contextPath}/platform/dna/federation/catalogs`,
    i18nNamespaces: [],
    name: 'dna-federation-catalogs'
  },
  'platform.dna-federation-schemas': {
    baseUrl: `${contextPath}/platform/dna/federation/schemas`,
    i18nNamespaces: [],
    name: 'dna-federation-schemas'
  },
  'platform.dna-federation-views': {
    baseUrl: `${contextPath}/platform/dna/federation/views`,
    i18nNamespaces: [],
    name: 'dna-federation-views'
  },
  'platform.dna-federation-query-policies': {
    baseUrl: `${contextPath}/platform/dna/federation/query-policies`,
    i18nNamespaces: [],
    name: 'dna-federation-query-policies'
  },
  'platform.dna-federation-query-audits': {
    baseUrl: `${contextPath}/platform/dna/federation/query-audits`,
    i18nNamespaces: [],
    name: 'dna-federation-query-audits'
  },
  'platform.dna-federation-sql-console': {
    baseUrl: `${contextPath}/platform/dna/federation/sql-console`,
    i18nNamespaces: [],
    name: 'dna-federation-sql-console'
  }
}
