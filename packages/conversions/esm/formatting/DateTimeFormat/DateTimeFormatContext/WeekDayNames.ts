/** Module that emplements a type that represents the names of the seven days of a week */
import * as MTypes from '@parischap/effect-lib/MTypes'

/**
 * Type of a CVWeekDayNames
 *
 * @category Models
 */
export interface Type extends MTypes.Tuple<string, 7> {}
