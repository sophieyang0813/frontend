/* global JsonRoutes */
import { json } from 'body-parser'
import getPendingInvitations from './get-pending-invitations'
import putPendingInvitations from './put-pending-invitations'
import getInvitations from './get-invitations'
import getConvertedInvitations from './get-converted-invitations'
import postProcessDbChangeMessage from './post-process-db-change-message'
import postSesNotification from './post-ses-notification'

JsonRoutes.Middleware.use(json())
JsonRoutes.Middleware.use((req, res, next) => {
  // The response objects are missing the traditional "send" method by default, so it has to be created artificially
  res.send = (code, data, headers = {}) => {
    if (typeof code !== 'number') {
      data = code
      code = 200
    }
    JsonRoutes.sendResult(res, { data, code, headers })
  }
  next()
})

const apiBase = '/api'
const createRoute = (method, url, handler) => {
  JsonRoutes.add(method, apiBase + url, handler)
}

createRoute('get', '/pending-invitations', getPendingInvitations)
createRoute('get', '/invitations', getInvitations)
createRoute('get', '/converted-invitations', getConvertedInvitations)
createRoute('put', '/pending-invitations/done', putPendingInvitations)
createRoute('post', '/db-change-message/process', postProcessDbChangeMessage)
createRoute('post', '/ses', postSesNotification)
