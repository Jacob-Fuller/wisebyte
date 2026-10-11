Pod::Spec.new do |s|
  s.name           = 'WbStore'
  s.version        = '1.0.0'
  s.summary        = 'StoreKit 2 bridge for Wisebyte'
  s.description    = 'Subscriptions and one-time purchases for Wisebyte'
  s.author         = 'Wisebyte'
  s.homepage       = 'https://wisebyte.app'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.swift_version  = '5.9'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'SWIFT_COMPILATION_MODE' => 'wholemodule' }
  s.source_files   = '**/*.{h,m,swift}'
end
