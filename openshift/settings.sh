# bash script to be sourced to set environment variables for OpenShift scripts

export PROJECT_NAMESPACE="30245e"

export GIT_URI="https://github.com/bcgov/nr-mals.git"
export GIT_REF="master"

# The templates that should not have their GIT references (uri and ref) over-ridden
# Templates NOT in this list will have they GIT references over-ridden
# with the values of GIT_URI and GIT_REF
export -a skip_git_overrides=""

# The project components
export components=${components:-"app"}

# The builds to be triggered after buildconfigs created (not auto-triggered)
export builds=${builds:-""}

# The images to be tagged after build
export images=${images:-""}

# The routes for the project
export routes=${routes:-""}
