import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router';
import ContextMenuIcon from '../../contextMenu/contextMenuIcon';
import './homePageBaseItem.scss'

class BaseItem extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className='base-name'>
          {this.props.base.name}
        </div>
        <div className = 'one-base-wrapper' >
        <div className = 'one-base' style = {{backgroundColor: `${this.props.base.color}` }} > 
          <div className = 'one-base-icon'>
            <Link to={`/dashboard/${this.props.base._id}`}>
            <Icon inverted link  size='huge' name={this.props.base.icon} 
              />
              </Link>
            </div>
            <div> 
              <div>
                <ContextMenuIcon 
                  handleClick = {this.props.handleClick}
                  baseId = {this.props.base._id}
                  menu={this.props.menu}             
                  />
              </div>
            </div>
        </div>
      </div>
    </div>
    )
  }
}

export default BaseItem