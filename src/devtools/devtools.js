import {getRawAppData} from '../applications/apps'
import {removeCyclicReferences} from './devtools.helper'

export function getAppData() {
  const apps = getRawAppData()

  return removeCyclicReferences(apps)
}