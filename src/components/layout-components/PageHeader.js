import React from 'react'

export const PageHeader = ({ title, display }) => {
	return (
		display ? (
			<div className="app-page-header">
				<h3 className="mb-0 mr-3 font-weight-semibold">
				</h3>
			</div>
		)
		: null
	)
}

export default PageHeader