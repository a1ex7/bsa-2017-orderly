import React, {Component} from 'react';
import BaseItem from './homePageBaseItem';

let temporaryKey = 0;

class BaseList extends Component {
	constructor(props) {
		super(props)

	}

	render() {
		const props = this.props
		return (
            <div className='base-list'>
				{ this.props.bases.map(function (base) {
					return (
                        <div key={base._id || ++temporaryKey}>
                          <BaseItem className="base-list-item"
                                    handleClick={props.handleClick}
                                    base={base}
                                    menu={props.menu}
                          />
                        </div>
					)
				})
				}
              <div className='btn-add-base' onClick={() => props.onNewBaseClick('#234FED', props.teamId)}>+</div>
            </div>

		)
	}
}

export default BaseList