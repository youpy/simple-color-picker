# based on: http://gravelog.blogspot.com/2007/03/using-rake-to-build-firefox-extensions_04.html
require 'nokogiri'

EXTENSION_NAME="SimpleColorPicker"
BUILD_DIR="build/#{EXTENSION_NAME}"

directory "#{BUILD_DIR}/chrome"
task :create_buildchrome_dir => ["#{BUILD_DIR}/chrome"]

desc "prepare the chrome.manifest file"
file "#{BUILD_DIR}/chrome.manifest" => [:create_buildchrome_dir] do
  open("#{BUILD_DIR}/chrome.manifest",'w') do |infile|
    open("chrome.manifest", "r") do |outfile|
      while line = outfile.gets
        infile.puts line.gsub(/chrome\//, "jar:chrome/#{EXTENSION_NAME}.jar!/")
      end
    end
  end
end
task :create_chrome_manifest => ["#{BUILD_DIR}/chrome.manifest"]

desc "prepare the install.rdf file"
file "#{BUILD_DIR}/install.rdf" => [:create_buildchrome_dir] do
  cp 'install.rdf', "#{BUILD_DIR}/install.rdf"
end
task :create_install_rdf => ["#{BUILD_DIR}/install.rdf"]

desc "create the chrome jar file"
task :create_chrome_jar => [:create_buildchrome_dir] do
  sh "cd chrome && zip -qr -0 ../#{BUILD_DIR}/chrome/#{EXTENSION_NAME}.jar * -x \*.svn\*"
end

desc "create the xpi file and use the version number in the file name"
task :create_extension_xpi => [:create_chrome_jar, :create_chrome_manifest, :create_install_rdf] do
  install_rdf_file = File.new('install.rdf','r')
  install_rdf_xmldoc = Nokogiri::XML(install_rdf_file)
  version_number = ""
  e = install_rdf_xmldoc.xpath('(//RDF:Description)[2]')[0]
  version_number = e['version']

  sh "cd #{BUILD_DIR} && zip -qr -9 ../../#{EXTENSION_NAME}-#{version_number}-fx.xpi *"
  rm_rf "build"
end

desc "install to local profile directory"
task :install do
  File.open("#{firefox_profile_dir}/extensions/#{extension_id}", 'w') do |f|
    f.puts(Dir.pwd)
  end
end

desc "uninstall from local profile directory"
task :uninstall do
  File.unlink("#{firefox_profile_dir}/extensions/#{extension_id}")
end

def firefox_profile_dir(name = nil)
  name = 'default' unless name

  base =
    case RUBY_PLATFORM
    when /darwin/
      '~/Library/Application Support/Firefox/Profiles'
    when /win/
      '~/Application Data/Mozilla/Firefox/Profiles'
    else
      '~/.mozilla/firefox'
    end

  path = Dir.glob("#{File.expand_path(base)}/*.#{name}")

  if path.length == 1
    path.first
  else
    raise
  end
end

def extension_id
  open('install.rdf') do |file|
    install_rdf_xmldoc = Nokogiri::XML(file)
    e = install_rdf_xmldoc.xpath('(//RDF:Description)[2]')[0]
    return e['id']
  end
end
