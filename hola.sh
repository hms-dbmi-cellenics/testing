# pat='*.scp-staging.biomage.net/'
s='https://ui-martinfosco-ui481-api216.scp-staging.biomage.net/data-management'
# [[ $s =~ $pat ]] # $pat must be unquoted
# echo "${BASH_REMATCH[0]}"
# echo "${BASH_REMATCH[1]}"

# *.scp-staging.biomage.net/*

[[ $s =~ \.scp-staging\.biomage\.net\/ ]] && echo "yes"



[[ $s =~ \.scp-staging\.biomage\.net\/ ]] && 