require 'json'

result = {}
File.open(ARGV[0]).read.each_line do |line|
  tokens = line.strip.split(',')
  result[tokens[0]]= tokens[1]
end

json = result.to_json

print json
