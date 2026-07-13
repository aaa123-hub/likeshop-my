import request from '@/utils/request'
import { resolveImage } from '@/utils/image-placeholder'

function normalizeArticle(page = {}, fallbackCode = '') {
    return {
        ...page,
        id: page.pageCode || page.id || fallbackCode,
        title: page.title || '',
        synopsis: page.synopsis || page.summary || '',
        image: resolveImage(page.image || page.coverUrl || page.cover || ''),
        create_time: page.create_time || page.updatedAt || '',
        visit: page.visit ?? '',
        content: page.content || ''
    }
}

function normalizeArticlePage(res, pageCode) {
    if (res.code != 1) return res
    const article = normalizeArticle(res.data || {}, pageCode)
    return {
        ...res,
        data: {
            list: [article],
            lists: [article],
            more: false,
            page_no: 1,
            page_size: 1,
            total: 1
        }
    }
}

function pageCodeFromParams(data = {}) {
    if (data.id) return data.id
    if (data.pageCode) return data.pageCode
    return data.type ? 'help_center' : 'mall_news'
}

export function getCategoryList(data = {}) {
    const pageCode = pageCodeFromParams(data)
    return request.get(`miniapp/content-pages/${pageCode}`).then((res) => {
        if (res.code != 1 || !res.data) {
            return {
                ...res,
                data: []
            }
        }
        return {
            ...res,
            data: [{
                id: pageCode,
                name: res.data.title || pageCode
            }]
        }
    })
}

export function getArticleList(data = {}) {
    const pageCode = pageCodeFromParams(data)
    return request.get(`miniapp/content-pages/${pageCode}`).then((res) => normalizeArticlePage(res, pageCode))
}

export function getArticleDetail(data = {}) {
    const pageCode = pageCodeFromParams(data)
    return request.get(`miniapp/content-pages/${pageCode}`).then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            data: normalizeArticle(res.data || {}, pageCode)
        }
    })
}
